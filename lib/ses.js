exports.init = function (genericAWSClient) {
  var createSESClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};
    return sesClient({
      host: options.host || "email.us-east-1.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: true,
      version: options.version
    });
  };
  var sesClient = function (obj) {
    var aws = genericAWSClient({
      host: obj.host,
      path: obj.path,
      accessKeyId: obj.accessKeyId,
      secretAccessKey: obj.secretAccessKey,
      secure: obj.secure,
      signHeader: true
    });
    obj.call = function(action, query, callback) {
      query["Action"] = action
      return aws.call(action, query, callback);
    }
    return obj;
  };
  return createSESClient;
};
