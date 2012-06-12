
exports.init = function(genericAWSClient) {
  // Creates an autoscaling API client
  var createASClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};

    var client = asClient({
      host: options.host || "autoscaling.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      version: options.version
    });
    return client;
  }
  // Amazon autoscaling API handler which is wrapped around the genericAWSClient
  var asClient = function(obj) {
    var aws = genericAWSClient({
      host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
      secretAccessKey: obj.secretAccessKey, secure: obj.secure
    });
    obj.call = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = obj.version || '2011-01-01'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return obj;
  }
  return createASClient;
}
