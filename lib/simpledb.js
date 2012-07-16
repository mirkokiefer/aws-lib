exports.init = function(genericAWSClient) {
  // Creates a SimpleDB API client
  return function (accessKeyId, secretAccessKey, options) {
    options = options || {};
    var aws = genericAWSClient({
      host: options.host || "sdb.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure
    })
    var callFn = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = options.version || '2009-04-15'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return {call: callFn};
  }
}