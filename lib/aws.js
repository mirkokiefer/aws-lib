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
var sns = require("./sns");
var ses = require("./ses");
var elb = require("./elb");
var iam = require("./iam");
var sts = require("./sts");
var cw = require("./cw");

// Returns the hmac digest using the SHA256 algorithm.
function hmacSha256(key, toSign) {
  var hash = crypto.createHmac("sha256", key);
  return hash.update(toSign).digest("base64");
}
// a generic AWS API Client which handles the general parts
var genericAWSClient = function(obj) {
  var creds = crypto.createCredentials({});
  if (null == obj.secure)
    obj.secure = true;

  obj.connection = obj.secure ? https : http;
  obj.call = function (action, query, callback) {
    if (obj.secretAccessKey == null || obj.accessKeyId == null) {
      throw("secretAccessKey and accessKeyId must be set")
    }

    var now = new Date();

    if (!obj.signHeader) {
      // Add the standard parameters required by all AWS APIs
      query["Timestamp"] = now.toISOString();
      query["AWSAccessKeyId"] = obj.accessKeyId;
      query["Signature"] = obj.sign(query);
    }

    var body = qs.stringify(query);
    var headers = {
      "Host": obj.host,
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      "Content-Length": body.length
    };

    if (obj.signHeader) {
      headers["Date"] = now.toUTCString();
      headers["x-amzn-authorization"] =
      "AWS3-HTTPS " +
      "AWSAccessKeyId=" + obj.accessKeyId + ", " +
      "Algorithm=HmacSHA256, " +
      "Signature=" + hmacSha256(obj.secretAccessKey, now.toUTCString());
    }

    var options = {
      host: obj.host,
      path: obj.path,
      agent: obj.agent,
      method: 'POST',
      headers: headers
    };
    var req = obj.connection.request(options, function (res) {
      var data = '';
      //the listener that handles the response chunks
      res.addListener('data', function (chunk) {
        data += chunk.toString()
      })
      res.addListener('end', function() {
        var parser = new xml2js.Parser();
        parser.addListener('end', function(result) {
          if (typeof result != "undefined" && typeof result.Errors != "undefined"){
            callback(result.Errors.Error.Message, result)
          } else {
            callback(null, result)
          }
        });
        parser.parseString(data);
      })
    });
    req.write(body)
    req.end()
  }
  /*
   Calculate HMAC signature of the query
   */
  obj.sign = function (query) {
    var keys = []
    var sorted = {}

    for(var key in query)
      keys.push(key)

    keys = keys.sort()

    for(var n in keys) {
      var key = keys[n]
      sorted[key] = query[key]
    }
    var stringToSign = ["POST", obj.host, obj.path, qs.stringify(sorted)].join("\n");

    // Amazon signature algorithm seems to require this
    stringToSign = stringToSign.replace(/!/g,"%21");
    stringToSign = stringToSign.replace(/'/g,"%27");
    stringToSign = stringToSign.replace(/\*/g,"%2A");
    stringToSign = stringToSign.replace(/\(/g,"%28");
    stringToSign = stringToSign.replace(/\)/g,"%29");

    return hmacSha256(obj.secretAccessKey, stringToSign);
  }
  return obj;
}

exports.createEC2Client = ec2.init(genericAWSClient);
exports.createProdAdvClient = prodAdv.init(genericAWSClient);
exports.createSimpleDBClient = simpledb.init(genericAWSClient);
exports.createSQSClient = sqs.init(genericAWSClient);
exports.createSNSClient = sns.init(genericAWSClient);
exports.createSESClient = ses.init(genericAWSClient);
exports.createELBClient = elb.init(genericAWSClient);
exports.createIAMClient = iam.init(genericAWSClient);
exports.createSTSClient = sts.init(genericAWSClient);
exports.createCWClient = cw.init(genericAWSClient);
