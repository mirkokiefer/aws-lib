exports.init = function (genericAWSClient) {
  return function (accessKeyId, secretAccessKey, options) {
    options = options || {};
    var aws = genericAWSClient({
      host: options.host || "email.us-east-1.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      signHeader: true
    });
    var callFn = function(action, query, callback) {
      query["Action"] = action
      return aws.call(action, query, callback);
    }
    return {
        client: aws,
        call: callFn
    };
  }
}
