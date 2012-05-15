var aws = require("../lib/aws");

as = aws.createASClient(yourAccessKeyId, yourSecretAccessKey);

as.call("DescribeLaunchConfigurations", {}, function(result) {
  console.log(JSON.stringify(result));
})