exports.init = function(genericAWSClient) {
  // Creates a CloudFormation API client
  var createCloudFormationClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};

    var client = CloudFormationClient({
      host: options.host || "cloudformation.us-east-1.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      version: options.version
    });
    return client;
  }
  // Amazon CloudFormation API handler which is wrapped around the genericAWSClient
  var CloudFormationClient = function(obj) {
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
  return createCloudFormationClient;
}
