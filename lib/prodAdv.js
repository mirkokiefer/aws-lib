exports.init = function(genericAWSClient) {
  //creates an Amazon Product Advertising API Client
  var createProdAdvClient = function (accessKeyId, secretAccessKey, associateTag, options) {
    options = options || {};
    var aws = genericAWSClient({
      host: options.host || "ecs.amazonaws.com",
      path: options.path || "/onca/xml",
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      secure: options.secure
    });
    var callFn = function(action, query, callback) {
      query["Operation"] = action
      query["Service"] = "AWSECommerceService"
      query["Version"] = options.version || '2009-10-01'
      query["AssociateTag"] = associateTag;
      query["Region"] = options.region || "US"
      return aws.call(action, query, callback);
    }
    return {
        client: aws,
        call: callFn
    };
  }
  return createProdAdvClient;
}