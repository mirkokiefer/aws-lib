
assert = require('assert');
aws = require('../lib/aws');
credentials = require('./credentials');

sqs = aws.createSQSClient(credentials.accessKeyId, credentials.secretAccessKey);

describe('sqs', function() {
  describe('ListQueues', function() {
    it('should return all queues', function(done) {
      sqs.call ( "ListQueues", {}, function (err, res) { 
        assert.ok(res.ListQueuesResult);
        done(err) 
      });
    })
  })
})