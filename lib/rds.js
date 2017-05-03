
exports.init = function(genericAWSClient) {
  // Creates an RDS API client
  var createRDSClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};

    var client = RDSClient({
      host: options.host || "rds.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      version: options.version
    });
    return client;
  }
  // Amazon RDS API handler which is wrapped around the genericAWSClient
  var RDSClient = function(obj) {
    var aws = genericAWSClient({
      host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
      secretAccessKey: obj.secretAccessKey, secure: obj.secure
    });
    obj.call = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = '2012-04-23'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return obj;
  }
  return createRDSClient;
}
