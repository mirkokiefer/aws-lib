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
var as = require("./as");
var cfn = require("./cfn");
var emr = require("./emr");
var metadata = require("./metadata.js");

// Returns the hmac digest using the SHA256 algorithm.
function hmacSha256(key, toSign) {
  var hash = crypto.createHmac("sha256", key);
  return hash.update(toSign).digest("base64");
}

// Try to get access id and secret key from ec2 metadata API
function checkCredentials(obj, cb) {
  var lapse = obj.expires == null ? 0 : +new Date() - Date.parse(obj.expires);
  if (obj.secretAccessKey == null || obj.accessKeyId == null || lapse > 0) {
    var md = metadata.init();
    md().call({endpoint: 'iam/security-credentials/'}, function(err, res) {
      if (err) return cb(err);
      if (typeof res === 'undefined') return cb(new Error('metadata API response undefined'));
      md().call({endpoint: 'iam/security-credentials/' + res.split('\n')[0]},
       function(err, res) {
        try {
          res = JSON.parse(res);
        } catch(e) {
          return cb(e);
        }
        if (res.SecretAccessKey === null)
          return cb(new Error("secretAccessKey and accessKeyId not provided and could not be determined."));
        obj.secretAccessKey = res.SecretAccessKey;
        obj.accessKeyId = res.AccessKeyId;
        obj.token = res.Token;
        obj.expires = res.Expiration;
        cb(null, obj);
      });
    });
  } else {
    cb(null, obj);
  }
}

// a generic AWS API Client which handles the general parts
var genericAWSClient = function(obj) {
  var creds = crypto.createCredentials({});
  if (null == obj.secure)
    obj.secure = true;

  obj.connection = obj.secure ? https : http;
  obj.call = function (action, query, callback) {
    // Wrap the callback to prevent it from being called multiple times.
    callback = (function(next) {
      var isCalled = false;
      return function() {
        if (isCalled) return;
        isCalled = true;
        next.apply(null, arguments);
      }
    })(callback)
    // Try to set credentials with metadata API if no credentials provided
    checkCredentials(obj, function(err, obj) {
      if (err) throw err;
      var now = new Date();
      if (!obj.signHeader) {
        // Add the standard parameters required by all AWS APIs
        if (obj.token !== undefined) query["SecurityToken"] = obj.token;
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
        if (obj.token !== undefined) headers["x-amz-security-token"] = obj.token;
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
            if (typeof result != "undefined") {
              var err = result.Error || (result.Errors ? result.Errors.Error : null)
              if (err) {
                callback(new Error(err.Message), result)
              } else {
                callback(null, result)
              }
            } else {
              callback(new Error('Unable to parse XML from AWS.'))
            }
          });
          parser.parseString(data);
        })
        res.addListener('error', callback)
      });
      req.write(body)
      req.addListener('error', callback)
      req.end()

      return req;
    });
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
exports.createASClient = as.init(genericAWSClient);
exports.createCFNClient = cfn.init(genericAWSClient);
exports.createEMRClient = emr.init(genericAWSClient);
exports.createMetaDataClient = metadata.init();
