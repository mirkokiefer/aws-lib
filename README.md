Node.js library for the Amazon Web Services
=====

A simple [Node.js](http://github.com/ry/node) library to communicate with the Amazon Web Services API.

This version of aws-lib requires Node v0.4! You can use v0.0.4 if you need to stick to Node v2.6.

It includes clients for the following services:

   * EC2
   * Product Advertising API
   * SimpleDB
   * SQS (Simple Queue Service)
   * SNS (Simple Notification Service)
   * SES (Simple Email Service)

Richard Rodger maintains a user-friendly [SimpleDB library](http://github.com/rjrodger/simpledb) which is based on aws-lib.

aws-lib is designed to be easily extensible. If you want to add your own API client, have a look at ec2.js or simpledb.js and simply follow their example.

Some simple usage examples:

    var aws = require("aws-lib");

    ec2 = aws.createEC2Client(yourAccessKeyId, yourSecretAccessKey);

    ec2.call("DescribeInstances", {}, function(result) {
      console.log(JSON.stringify(result));
    })

Returns you a JSON response which looks something like this:
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