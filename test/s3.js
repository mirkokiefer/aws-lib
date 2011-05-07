

var aws = require("../lib/aws.js");


var s3 = aws.createS3Client(credentials.accessKeyId, credentials.secretAccessKey);

s3.putObject(pathToFile, {
    "acl": "public-read",
    "bucket": "bucket",
    "path": "/path/relative/to/bucket",
    "contentType": "text/plain",    // optional - default: "binary/octet-stream"
    "contentLength": 100    // optional
}, function(result) {

    // success
    
    console.log(result);
            
});
