Node.js library for the Amazon Web Services
=====

A simple [Node.js](http://github.com/ry/node) library to communicate with the Amazon Web Services API.

This version of aws-lib has been tested on Node v0.6.11.

It includes clients for the following services:

   * [EC2](https://github.com/livelycode/aws-lib/blob/master/examples/ec2.js)
   * [Product Advertising API](https://github.com/livelycode/aws-lib/blob/master/examples/prod-adv.js)
   * [SimpleDB](https://github.com/livelycode/aws-lib/blob/master/test/simpledb.js)
   * [SQS (Simple Queue Service)](https://github.com/livelycode/aws-lib/blob/master/examples/sqs.js)
   * SNS (Simple Notification Service)
   * [SES (Simple Email Service)](https://github.com/livelycode/aws-lib/blob/master/examples/ses.js)
   * [ELB (Elastic Load Balancing Service)](https://github.com/livelycode/aws-lib/blob/master/examples/elb.js)
   * [CW (CloudWatch)](https://github.com/livelycode/aws-lib/blob/master/examples/cw.js)
   * [IAM (Identity and Access Management)](https://github.com/livelycode/aws-lib/blob/master/examples/iam.js)
   * [CFN (CloudFormation)](https://github.com/livelycode/aws-lib/blob/master/test/cfn.js)
   * STS (Security Token Service)
   * [Elastic MapReduce](https://github.com/livelycode/aws-lib/blob/master/test/emr.js)

Richard Rodger maintains a user-friendly [SimpleDB library](http://github.com/rjrodger/simpledb) which is based on aws-lib.

## Usage

The following snippet implements an ec2 client and makes a call to DescribeInstances

    var aws = require("aws-lib");

    ec2 = aws.createEC2Client(yourAccessKeyId, yourSecretAccessKey);

    ec2.call("DescribeInstances", {}, function(err, result) {
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

    prodAdv.call("ItemSearch", {SearchIndex: "Books", Keywords: "Javascript"}, function(err, result) {
      console.log(JSON.stringify(result));
    })

Will return a long list of books.

Most clients, such as ec2, ses, simpledb, etc. accept an optional third parameter `options` which should be an object of options used to instantiate the client.  For example, the ec2 client could be instantiated with an options object like:

    ec2 = aws.createEC2Client(yourAccessKeyId, yourSecretAccessKey, {version: '2010-08-31'});
    
which would instantiate the ec2 client, but using the 2010-08-31 API version.  See the library code for each service to learn about other possible options.

For more examples have a look at [/examples](https://github.com/livelycode/aws-lib/tree/master/examples) and [/test](https://github.com/livelycode/aws-lib/tree/master/test).

## Tests
In order to run the tests you need to copy "test/credentials_template.js" to "test/credentials.js" and add your access key and secret.  
credentials.js is part of .gitignore so you don't have to worry about accidentially commiting your secret.

To run the tests execute:

    npm test


## Contributing
aws-lib is designed to be easily extensible.  
If you want to add support for a service, have a look at an [existing client](https://github.com/livelycode/aws-lib/blob/master/lib/ec2.js) and simply follow the pattern.  
When submitting a pull request please add a test for at least one API call.

Many thanks to the following people who have contributed so far (ordered by number of commits):

```
Mirko Kiefer
Paul Bonser
Bernhard K. Weisshuhn
Kent
David Valentiate
Richard Rodger
Sean Coates
john
Jonathan Leibiusky
Matt Duncan
Cameron Gray
Bryon
nagoodman
Blake Matheny
Van Nguyen
Ian Ward
Johannes Auer
Chris Castle
Mike MacCana
```
