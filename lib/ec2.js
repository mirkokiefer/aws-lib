
exports.init = function(genericAWSClient) {
  // Creates an EC2 API client
  var createEC2Client = function (accessKeyId, secretAccessKey, options) {
    options = options || {}
    var aws = genericAWSClient({
      host: options.host || "ec2.amazonaws.com",
      path: options.path || "/",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure,
      token: options.token
    });
    var callFn = function(action, opts, callback) {
	  var query = {};
      query["Action"] = action
      query["Version"] = options.version || "2012-12-01"
      query["SignatureMethod"] = "HmacSHA256"
      query["SignatureVersion"] = "2"
      //add options to the end of the query
	  for(var key in opts){
		   query[key] = opts[key];
	   }

      return aws.call(action, query, callback);
    }
    return {
        client: aws,
        call: callFn
    };
  }
  return createEC2Client;
}