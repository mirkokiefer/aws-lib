
exports.init = function(genericAWSClient) {
  // Creates an CloudWatch API client
  var createCWClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};

    var client = cwClient({
      host: options.host || "monitoring.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      version: options.version
    });
    return client;
  }
  // Amazon CW API handler which is wrapped around the genericAWSClient
  var cwClient = function(obj) {
    var aws = genericAWSClient({
      host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
      secretAccessKey: obj.secretAccessKey, secure: obj.secure
    });
    obj.call = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = obj.version || '2010-08-01'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return obj;
  }
  return createCWClient;
}
