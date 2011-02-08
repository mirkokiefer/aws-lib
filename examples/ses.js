var aws = require("../lib/aws");

ses = aws.createSESClient(yourAccessKeyId, yourSecretAccessKey);

ses.call("GetSendQuota", {}, function(result) {
  console.log(JSON.stringify(result));
});

ses.call("GetSendStatistics", {}, function(result) {
  console.log(JSON.stringify(result));
});

ses.call("ListVerifiedEmailAddresses", {}, function(result) {
  console.log(JSON.stringify(result));
});