var http = require("http");
var https = require("https");
var qs = require("querystring")
var crypto = require("crypto")
var events = require("events")
var xml2js = require("xml2js")

// include specific API clients
var ec2 = require("./ec2");
var prodAdv = require("./prodAdv");
var simpledb = require("./simpledb");
var sqs = require("./sqs");

// a generic AWS API Client which handles the general parts
var genericAWSClient = function(obj) {
  obj.call = function (action, query, callback) {
    if (obj.secretAccessKey == null || obj.accessKeyId == null) {
      throw("secretAccessKey and accessKeyId must be set");
    }
    if (obj.secure == null) {
      obj.secure = true;
    }
    var now = new Date();
    var ts = now.toISOString();

    // add the standard parameters required by all AWS APIs
    query["Timestamp"] = ts;
    query["AWSAccessKeyId"] = obj.accessKeyId;
    query["Signature"] = obj.sign(query);

    var body = qs.stringify(query);

    // HTTP or HTTPS
    var conn = obj.secure ? https : http;
    var port = obj.secure ? 443 : 80;

    var options = {
      host: obj.host,
      port: port,
      path: obj.path + '?' + body,
      method: 'POST'
    };

    var data = '';
    var req = conn.request(options, function(res) {
      res.on('data', function(d) {
        data += d;
      });
      res.on('end', function() {
        var parser = new xml2js.Parser();
        parser.on('end', function(result) {
          callback(result);
        });
        parser.parseString(data);
      });
      res.on('error', function(e) {
        throw('Got error: ' + e.message);
      });
    });
    req.end();
  }
  /*
   * URL encoding
   */
  obj.urlencode = function(item) {
    return item.replace(/!/g, '%21').replace(/'/g, '%27').
    replace(/\(/g, '%28').replace(/\)/g, '%29').
    replace(/\*/g, '%2A');
  }
  /*
   Calculate HMAC signature of the query
   */
  obj.sign = function (query) {
    var hash = crypto.createHmac("sha256", obj.secretAccessKey);
    var keys = [];
    var sorted = {};
    for(var key in query) {
      keys.push(key);
    }
    keys = keys.sort();
    for(n in keys) {
      var key = keys[n];
      sorted[key] = query[key];
    }
    var stringToSign = ["POST", obj.host, obj.path, obj.urlencode(qs.stringify(sorted))].join("\n");
    return hash.update(stringToSign).digest("base64");
  }
  return obj;
}
exports.createEC2Client = ec2.init(genericAWSClient);
exports.createProdAdvClient = prodAdv.init(genericAWSClient);
exports.createSimpleDBClient = simpledb.init(genericAWSClient);
exports.createSQSClient = sqs.init(genericAWSClient);
