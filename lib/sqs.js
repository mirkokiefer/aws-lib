exports.init = function(genericAWSClient) {
  // Creates a Simple Queue Service API client
  var createSQSClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};

    var client = SQSClient({
      host: options.host || "sqs.us-east-1.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      version: options.version
    });
    return client;
  }
  // Amazon Simple Queue Service API client
  var SQSClient = function(obj) {
    var aws = genericAWSClient({
      host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
      secretAccessKey: obj.secretAccessKey, secure: obj.secure
    })
    obj.call = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = obj.version || '2009-02-01'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return obj;
  }
  return createSQSClient;
}