var swirl = require("./lib/node-aws");

prodAdv = swirl.createProdAdvClient(yourAccessKeyId, yourSecretAccessKey, yourAssociateTag);

prodAdv.call("ItemSearch", {SearchIndex: "Books", Keywords: "Javascript"}, function(result) {
  console.log(JSON.stringify(result));
})