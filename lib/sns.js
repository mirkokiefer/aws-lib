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
			query["Action"] = action;
			query["SignatureMethod"] = "HmacSHA256";
			query["SignatureVersion"] = "2"; 
			return aws.call(action, query, callback);
		}
		// Checks that a topic name conforms to Amazon constraints
		obj.nameOk = function(topic) {
			if(topic.match(/^[\w\-]{1,256}/i)){
				return true;
			}
			return false;
		}

		// Create a topic
		obj.createTopic = function(topic) {
			obj.call(
				"CreateTopic",
				{
					"Name": topic
				},
				function(result) {
					if(result.Error) {
						console.log("CreateTopic Error: " + result.Error.Message);
						callback(false);
					} else {
						var topicArn = result.CreateTopicResult.TopicArn;
						console.log("Successfully created topic " + topicArn);
						callback();
					}
				}
			);
		}

		// Retrieve all topics in format: {"SimpleName":"arn:aws:sns:my-region:numericId:SimpleName",}
		obj.listTopics = function(callback) {
			obj.call(
				"ListTopics",
				{},
				function(result) {
					if(result.Error) {
						console.log("ListTopics Error: " + result.Error.Message);
					} else {
						var topicList = result.ListTopicsResult.Topics.member;
						var topics = {};

						for(var n in topicList) {
							var components = topicList[n].TopicArn.split(":");
							var simpleName = components[5];
							topics[simpleName] = topicList[n].TopicArn;
						}

						callback(topics);
					}
				}
			);
		}

		// Given a simple topic name of format "ThisSubject", ensure it exists then fire callback
		obj.ensureTopicExists = function(topic, callback) {
			obj.listTopics(function(topics){
				if(topics[topic] === undefined) {
					if(obj.nameOk(topic)) {
						obj.createTopic(topic);
					}
				}
				callback(topics[topic]);
			});
		}
		return obj;
	}
	return createSNSClient;
}
