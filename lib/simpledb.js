exports.init = function(genericAWSClient) {
  // Creates a SimpleDB API client
  var createSimpleDBClient = function (accessKeyId, secretAccessKey, options) {
    options = options || {};

    var client = simpledbClient({
      host: options.host || "sdb.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      version: options.version
    });
    return client;
  }
  // Amazon SimpleDB API client
  var simpledbClient = function(obj) {
    var aws = genericAWSClient({
      host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
      secretAccessKey: obj.secretAccessKey, secure: obj.secure
    })
    obj.call = function(action, query, callback) {
      query["Action"] = action
      query["Version"] = obj.version || '2009-04-15'
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      return aws.call(action, query, callback);
    }
    return obj;
  }
  return createSimpleDBClient;
}