var http = require("http")
var qs = require("querystring")
var crypto = require("crypto")
var events = require("events")
var xml2js = require("xml2js")

// include specific API clients
var ec2 = require("ec2");
var prodAdv = require("prodAdv");
var simpledb = require("simpledb");
var sqs = require("sqs");

// a generic AWS API Client which handles the general parts
var genericAWSClient = function(obj) {
  var creds = crypto.createCredentials({});
  if (null == obj.secure) obj.secure = true;
  
  obj.connection = http.createClient(obj.secure ? 443 : 80, obj.host, obj.secure, creds);
  obj.call = function (action, query, callback) {
    if (obj.secretAccessKey == null || obj.accessKeyId == null) {
      throw("secretAccessKey and accessKeyId must be set")
    }

    var now = new Date()
    var ts = now.toISOString()

    // add the standard parameters required by all AWS APIs
    query["Timestamp"] = ts;
    query["AWSAccessKeyId"] = obj.accessKeyId;
    query["Signature"] = obj.sign(query)

    var body = qs.stringify(query)
    var req = obj.connection.request("POST", obj.path, {
      "Host": obj.host,
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": body.length
    })

    //the listener that retrieves the response
    req.addListener('response', function (res) {
      var data = ''
      //the listener that handles the response chunks
      res.addListener('data', function (chunk) {
        data += chunk.toString()
      })
      res.addListener('end', function() {
        var parser = new xml2js.Parser();
        parser.addListener('end', function(result) {
          callback(result);
        });
        parser.parseString(data);
      })
    })

    req.write(body)
    req.end()
  }

  /*
    Calculate HMAC signature of the query
   */
  obj.sign = function (query) {
    var hash = crypto.createHmac("sha256", obj.secretAccessKey)
    var keys = []
    var sorted = {}

    for(var key in query)
      keys.push(key)

    keys = keys.sort()

    for(n in keys) {
      var key = keys[n]
      sorted[key] = query[key]
    }
    var stringToSign = ["POST", obj.host, obj.path, qs.stringify(sorted)].join("\n");

    // Amazon signature algorithm seems to require this
    stringToSign = stringToSign.replace(/'/g,"%27");
    stringToSign = stringToSign.replace(/\*/g,"%2A");
    
    return hash.update(stringToSign).digest("base64")
  }

  return obj;
}

exports.createEC2Client = ec2.init(genericAWSClient);
exports.createProdAdvClient = prodAdv.init(genericAWSClient);
exports.createSimpleDBClient = simpledb.init(genericAWSClient);
exports.createSQSClient = sqs.init(genericAWSClient);
