
var fs = require("fs");
var crypto = require("crypto");

exports.init = function(genericAWSClient) {
  // Creates an S3 API client
  var createS3Client = function (accessKeyId, secretAccessKey, options) {
    options = options || {};

    var client = s3Client({
      host: options.host || "s3.amazonaws.com",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure || true,
      version: options.version
    });
    return client;
  }
  // Amazon S3 API handler which is wrapped around the genericAWSClient
  var s3Client = function(obj) {
    var aws = genericAWSClient({
      host: obj.host,
      accessKeyId: obj.accessKeyId,
      secretAccessKey: obj.secretAccessKey, secure: obj.secure
    });

    if (aws.secretAccessKey == null || aws.accessKeyId == null) {
      throw("secretAccessKey and accessKeyId must be set")
    }

    function sign(method, path, headers)
    {
        var CanonicalizedAmzHeaders = "";
        CanonicalizedAmzHeaders += "x-amz-acl:" + headers["x-amz-acl"];
        
        var StringToSign = method + "\n" +
            headers["Content-MD5"] + "\n" +
            headers["Content-Type"] + "\n" +
            headers["Date"] + "\n" +
            CanonicalizedAmzHeaders + "\n" +
            path;

        return hmacSha1(aws.secretAccessKey, StringToSign);
    }
    
    function doRequest(method, path, headers, body, callback)
    {
        var req = aws.connection.request({
            host: headers.Host,
            method: method,
            path: path,
            headers: headers
        }, callback);
        req.on('error', function(e)
        {
            throw e;
        });
        req.write(body, encodingForContentType(headers["Content-Type"]));
        req.end();        
    }
    
    function prepareHeaders(options, body)
    {
        var now = new Date();

        var headers = {};
        headers["Host"] = options.bucket + "." + aws.host;
        headers["Date"] = now.toUTCString();
        validateAcl(headers["x-amz-acl"] = options.acl || "private");
        headers["Content-Type"] = options.contentType || "binary/octet-stream";
        headers["Content-Length"] = options.contentLength || body.length;
        var hash = crypto.createHash("md5");
        hash.update(body);
        headers["Content-MD5"] = hash.digest("base64");
        headers["Authorization"] = "AWS" + " " + aws.accessKeyId + ":" + sign("PUT", "/" + options.bucket + options.path, headers);

        if (body.length != headers["Content-Length"])
            throw new Error("Declared Content-Length does not match payload length!");

        return headers;
    }
    

    obj.putObject = function(path, options, callback) {

        // TODO: stream data if file is large and omit Content-MD5? 
        var body = fs.readFileSync(path, "binary");

        obj.putString(body, options, callback);
    }    

    obj.putString = function(body, options, callback) {

        var headers = prepareHeaders(options, body);

        hash = crypto.createHash("md5");
        hash.update(body);
        var md5Hash = hash.digest("hex");

        doRequest("PUT", options.path, headers, body, function(res)
        {
            if (res.statusCode === 200 && res.headers["etag"] == '"' + md5Hash + '"')
            {
                callback({
                    "x-amz-request-id": res.headers["x-amz-request-id"]
                });
                return;
            }
            else
                emitBodyAsError(res);
  
        });
    }

    return obj;
  }
  return createS3Client;
}

function emitBodyAsError(res)
{
    var data = '';
    res.on('data', function (chunk) {
      data += chunk.toString()
    })
    res.on('end', function()
    {
        throw new Error("Error storing file. Status '" + res.statusCode + "', message: " + data);
    });
}

var acls = [
    "private",
    "public-read",
    "public-read-write",
    "authenticated-read",
    "bucket-owner-read",
    "bucket-owner-full-control"
];

function validateAcl(acl)
{
    if (acls.indexOf(acl)===-1)
        throw new Error("Invalid ACL: " + acl);
    return acl;
}

var binaryTypes = [
    "binary/octet-stream",
    "application/zip",
    "application/x-xpinstall"
];

function encodingForContentType(contentType)
{
    if (binaryTypes.indexOf(contentType)!==-1)
        return "binary";
    return "utf8";
}

function hmacSha1(key, toSign) {
  var hash = crypto.createHmac("sha1", key);
  return hash.update(toSign).digest("base64");
}
