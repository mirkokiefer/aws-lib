Node-AWS for EC2 and Product Advertising
=====

A simple [Node.js](http://github.com/ry/node) library to communicate with the Amazon Web Services API.

It includes specific clients for the EC2 and Product Advertising API but is designed to be easily extendable.

Thanks to Richard Roger's contribution, the library now has support for SimpleDB, as well. Have a look at his tests for some examples.

All responses are parsed to JSON.

Some simple usage examples:

    var aws = require("aws-lib");

    ec2 = aws.createEC2Client(yourAccessKeyId, yourSecretAccessKey);

    ec2.call("DescribeInstances", {}, function(result) {
      console.log(JSON.stringify(result));
    })

Returns you something like:
    [...]
    {"item":{
      "instanceId":"i-acb2d1db","imageId":"ami-03765c77",
      "instanceState": {"code":"80","name":"stopped"},
      "privateDnsName":{},"dnsName":{},
      "reason":"User initiated (2010-07-28 19:37:54 GMT)"
    [...] 

or when using the Product Advertising API:
    prodAdv = aws.createProdAdvClient(yourAccessKeyId, yourSecretAccessKey, yourAssociateTag);

    prodAdv.call("ItemSearch", {SearchIndex: "Books", Keywords: "Javascript"}, function(result) {
      console.log(JSON.stringify(result));
    })

Will return you a long list of Books...