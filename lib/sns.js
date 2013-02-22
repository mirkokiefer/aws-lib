exports.init = function(genericAWSClient) {
	// Creates a Simple Notification Service API client
	var createSNSClient = function (accessKeyId, secretAccessKey, options) {
		options = options || {}; 

		var client = SNSClient({
				host: options.host || "sns.us-east-1.amazonaws.com",
				path: options.path || "/",
				accessKeyId: accessKeyId,
				secretAccessKey: secretAccessKey,
				secure: options.secure,
				version: options.version
			}); 
			return client;
	}

// Amazon Simple Notification Service API client
	var SNSClient = function(obj) {
		var aws = genericAWSClient({
				host: obj.host, path: obj.path, accessKeyId: obj.accessKeyId,
				secretAccessKey: obj.secretAccessKey, secure: obj.secure
			}); 
		obj.call = function(action, query, callback) {
			query["Action"] = action
			query["SignatureMethod"] = "HmacSHA256"
			query["SignatureVersion"] = "2" 
			return aws.call(action, query, callback);
		}   
		obj.client = aws;
		return obj;
	}
	return createSNSClient;
}
