exports.init = function(genericAWSClient) {
  // Creates an STS API client
  return function (accessKeyId, secretAccessKey, options) {
    options = options || {};
    var aws = genericAWSClient({
      host: options.host || "sts.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure
    });
    var callFn = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = options.version || '2011-06-15'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return {
        client: aws,
        call: callFn
    };
  }
}
