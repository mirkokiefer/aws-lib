exports.init = function(genericAWSClient) {
  // Creates an IAM API client
  var createIAMClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};
    var aws = genericAWSClient({
      host: options.host || "iam.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure
    });
    var callFn = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = options.version || '2010-05-08'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return {
        client: aws,
        call: callFn
    };
  }
  return createIAMClient;
}
