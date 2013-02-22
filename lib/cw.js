
exports.init = function(genericAWSClient) {
  // Creates an CloudWatch API client
  var createCWClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};
    var aws = genericAWSClient({
      host: options.host || "monitoring.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      token: options.token
    });
    var callFn = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = options.version || '2010-08-01'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return {
        client: aws,
        call: callFn
    };
  }
  return createCWClient;
}
