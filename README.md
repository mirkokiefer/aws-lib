Node.js library for the Amazon Web Services
=====

A simple [Node.js](http://github.com/ry/node) library to communicate with the Amazon Web Services API.

This version of aws-lib has been tested on Node v0.6.11.

It includes clients for the following services:

   * EC2
   * Product Advertising API
   * SimpleDB
   * SQS (Simple Queue Service)
   * SNS (Simple Notification Service)
   * SES (Simple Email Service)
   * ELB (Elastic Load Balancing Service) - added by [Bernhard Weißhuhn](https://github.com/bkw)
   * CW (CloudWatch)
   * IAM (Identity and Access Management)

Richard Rodger maintains a user-friendly [SimpleDB library](http://github.com/rjrodger/simpledb) which is based on aws-lib.

aws-lib is designed to be easily extensible. If you want to add your own API client, have a look at ec2.js or simpledb.js and simply follow their example.

### Usage

The following snippet implements an ec2 client and makes a call to DescribeInstances

    var aws = require("aws-lib");

    ec2 = aws.createEC2Client(yourAccessKeyId, yourSecretAccessKey);

    ec2.call("DescribeInstances", {}, function(result) {
      console.log(JSON.stringify(result));
    })

Which returns a JSON response similar to:

    [...]
    {"item":{
      "instanceId":"i-acb2d1db","imageId":"ami-03765c77",
      "instanceState": {"code":"80","name":"stopped"},
      "privateDnsName":{},"dnsName":{},
      "reason":"User initiated (2010-07-28 19:37:54 GMT)"
    [...] 

Another example, using Product Advertising API:

    prodAdv = aws.createProdAdvClient(yourAccessKeyId, yourSecretAccessKey, yourAssociateTag);

    prodAdv.call("ItemSearch", {SearchIndex: "Books", Keywords: "Javascript"}, function(result) {
      console.log(JSON.stringify(result));
    })

Will return a long list of books.

Most clients, such as ec2, ses, simpledb, etc. accept an optional third parameter `options` which should be an object of options used to instantiate the client.  For example, the ec2 client could be instantiated with an options object like:

    ec2 = aws.createEC2Client(yourAccessKeyId, yourSecretAccessKey, {version: '2010-08-31'});
    
which would instantiate the ec2 client, but using the 2010-08-31 API version.  See the library code for each service to learn about other possible options.
