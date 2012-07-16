
exports.init = function(genericAWSClient) {
  // Creates an EC2 API client
  var createEC2Client = function (accessKeyId, secretAccessKey, options) {
    options = options || {}
    var aws = genericAWSClient({
      host: options.host || "ec2.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure
    });
    var callFn = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = options.version || "2009-11-30"
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return {call: callFn};
  }
  return createEC2Client;
}