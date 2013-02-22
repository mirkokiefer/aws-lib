exports.init = function(genericAWSClient) {
  // Creates a Simple Queue Service API client
  return function (accessKeyId, secretAccessKey, options) {
    options = options || {};
    var aws = genericAWSClient({
      host: options.host || "sqs.us-east-1.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      agent: options.agent,
      token: options.token
    })
    var callFn = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = options.version || '2011-10-01'
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
