exports.init = function (genericAWSClient) {
  var createSESClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};
    options.host = options.host || "email.us-east-1.amazonaws.com";
    options.path = options.path || "/";

    var obj = {
      host: options.host,
      path: options.path,
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: true,
      signHeader: true
    };

    obj.call = function(action, query, callback) {
      var aws = genericAWSClient(obj);
      query["Action"] = action;
      return aws.call(action, query, callback);
    }

    return obj;
  };

  return createSESClient;
};
