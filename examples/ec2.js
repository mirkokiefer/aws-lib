var aws = require("aws-lib");

ec2 = aws.createEC2Client(yourAccessKeyId, yourSecretAccessKey);

ec2.call("DescribeInstances", {}, function(result) {
  console.log(JSON.stringify(result));
})