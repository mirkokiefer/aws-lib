var aws = require("../lib/aws");

cw = aws.createCWClient(yourAccessKeyId, yourSecretAccessKey);

cw.call("ListMetrics", {}, function(result) {
  console.log(JSON.stringify(result));
})
