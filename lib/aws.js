var sys = require("sys")
var http = require("http")
var qs = require("querystring")
var crypto = require("crypto")
var events = require("events")
var xml2js = require("./xml2js")


// Creates an EC2 API client
exports.createEC2Client = function (accessKeyId, secretAccessKey, options) {
  options = options || {};

  var host = options.host || "ec2.amazonaws.com";
  var path = "/";
  var client = ec2Client({
    host: host,
    path: path,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    secure: options.secure,
    version: options.version
  });
  return client;
}

//creates an Amazon Product Advertising API Client
exports.createProdAdvClient = function (accessKeyId, secretAccessKey, associateTag, options) {
  options = options || {};

  var host = "ecs.amazonaws.de";
  var path = "/onca/xml";
  var client = prodAdvClient({
    host: host,
    path: path,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    associateTag: associateTag,
    secure: options.secure,
    version: options.version
  });
  return client;
}

// Amazon EC2 API handler which is wrapped around the genericAWSClient
var ec2Client = function(obj) {
  var aws = genericAWSClient({
    host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
    secretAccessKey: obj.secretAccessKey, secure: obj.secure
  });
  obj.call = function(action, query, callback) {
    query["Action"] = action
    query["Version"] = obj.version || '2009-11-30'
    query["SignatureMethod"] = "HmacSHA256"
    query["SignatureVersion"] = "2"
    return aws.call(action, query, callback);
  }
  return obj;
}


// Amazon Product Advertising API handler which is wrapped around the genericAWSClient
var prodAdvClient = function(obj) {
  var aws = genericAWSClient({
    host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
    secretAccessKey: obj.secretAccessKey, secure: obj.secure
  });
  obj.call = function(action, query, callback) {
    query["Operation"] = action
    query["Service"] = "AWSECommerceService"
    query["Version"] = obj.version || '2009-10-01'
    query["AssociateTag"] = obj.associateTag;
    query["Region"] = "DE"
    return aws.call(action, query, callback);
  }
  return obj;
}

// a generic AWS API Client which handles the general parts
var genericAWSClient = function(obj) {
  var creds = crypto.createCredentials({});
  if (!obj.secure) obj.secure = true;

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
    return hash.update(stringToSign).digest("base64")
  }

  return obj;
}
