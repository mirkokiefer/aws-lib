
// espresso tests
// configure common.js with our amazon keys
// run on command line before tests: node lib/simpledb.test.js create
// you might need to do this a few times as CreateDomain gets frequent 'Service Unavailable' messages
// to remove test domains (test,test1,test2): node lib/simpledb.test.js delete

var util   = require('util')
var assert = require('assert')
var common = require('./common.js')

var aws = require("../lib/aws.js");

function createClient() {
  return aws.createSimpleDBClient(common.awskeyid, common.secretkey, {secure:false})
}

function createDomain(name,callback) {
  var sdb = createClient()
  sdb.call("CreateDomain", {DomainName:name}, callback)
}

function deleteDomain(name,callback) {
  var sdb = createClient()
  sdb.call("DeleteDomain", {DomainName:name}, callback)
}

if( 'create' == process.argv[2] ) {
  util.debug('Creating domains:...');
  createDomain('test',function(result){
    util.debug(JSON.stringify(result))
    util.debug('test')

    createDomain('test1',function(result){
      util.debug(JSON.stringify(result))
      util.debug('test1')

      createDomain('test2',function(result){
        util.debug(JSON.stringify(result))
        util.debug('test2')
      })
    })
  })
}
else if( 'delete' == process.argv[2] ) {
  util.debug('Deleting domains:...');
  deleteDomain('test',function(result){
    util.debug(JSON.stringify(result))
    util.debug('test')

    deleteDomain('test1',function(result){
      util.debug(JSON.stringify(result))
      util.debug('test1')

      deleteDomain('test2',function(result){
        util.debug(JSON.stringify(result))
        util.debug('test2')
      })
    })
  })
}


module.exports = {
  createClient: function() {
    var sdb = createClient()
    assert.isNotNull(sdb)
  },
  listDomains: function() {
    var sdb = createClient()
    sdb.call("ListDomains", {}, function(result) {
      util.debug(JSON.stringify(result))
      assert.ok( 0 < result.ListDomainsResult.DomainName.length )
    })
  },
  domainMetaData: function() {
    var sdb = createClient()
    sdb.call("DomainMetadata", {DomainName:'test'}, function(result) {
      util.debug(JSON.stringify(result))
      assert.ok(!!result.DomainMetadataResult)
    })
  },
  putAndGetAttributes: function() {
    var sdb = createClient()
    sdb.call("PutAttributes", {
      DomainName:'test',
      ItemName:'item1',

      'Attribute.0.Name':'foo',
      'Attribute.0.Value':'onefoo',
      'Attribute.0.Replace':'true',

      'Attribute.1.Name':'bar',
      'Attribute.1.Value':'onebar',
      'Attribute.1.Replace':'true',

      'Attribute.2.Name':'bar',
      'Attribute.2.Value':'twobar',
      'Attribute.2.Replace':'true',

    }, function(result) {
      util.debug(JSON.stringify(result))
      assert.ok(!result.Errors)

      sdb.call("GetAttributes", {
        DomainName:'test',
        ItemName:'item1',

      }, function(result) {
        util.debug(JSON.stringify(result))
        assert.ok( 3 == result.GetAttributesResult.Attribute.length )
      })
    })
  },
  deleteAttributes: function() {
    var sdb = createClient()
    sdb.call("PutAttributes", {
      DomainName:'test1',
      ItemName:'item1',

      'Attribute.0.Name':'foo',
      'Attribute.0.Value':'onefoo',
      'Attribute.0.Replace':'true',

      'Attribute.1.Name':'bar',
      'Attribute.1.Value':'onebar',
      'Attribute.1.Replace':'true',

    }, function(result) {
      util.debug(JSON.stringify(result))
      assert.ok(!result.Errors)

      sdb.call("DeleteAttributes", {
        DomainName:'test1',
        ItemName:'item1',
        'Attribute.1.Name':'bar',
      }, function(result) {

        sdb.call("GetAttributes", {
          DomainName:'test1',
          ItemName:'item1',

        }, function(result) {
          util.debug(JSON.stringify(result))
          assert.ok( !!result.GetAttributesResult.Attribute )
        })
      })
    })
  },
  batchPutAndSelect: function() {
    var sdb = createClient()
    sdb.call("BatchPutAttributes", {
      DomainName:'test2',

      'Item.0.ItemName':'foo',
      'Item.0.Attribute.0.Name':'val',
      'Item.0.Attribute.0.Value':'oneval',
      'Item.0.Attribute.0.Replace':'true',

      'Item.1.ItemName':'bar',
      'Item.1.Attribute.0.Name':'val',
      'Item.1.Attribute.0.Value':'twoval',
      'Item.1.Attribute.0.Replace':'true',

      'Item.2.ItemName':'woz',
      'Item.2.Attribute.0.Name':'val',
      'Item.2.Attribute.0.Value':'different',
      'Item.2.Attribute.0.Replace':'true',

    }, function(result) {
      util.debug(JSON.stringify(result))
      assert.ok(!result.Errors)

      sdb.call("Select", {
        SelectExpression:"select * from test2 where val like '%val%'",
        
      }, function(result) {
        util.debug(JSON.stringify(result))
        assert.ok( 2 == result.SelectResult.Item.length )
      })
    })
  }
}
