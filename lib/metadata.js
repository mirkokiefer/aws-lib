var http = require('http');

exports.init = function() {
  return function () {
    return {
      call: function(options, callback) {
        var version = options.version || 'latest';
        var endpoint = options.endpoint || '';
        var url = 'http://169.254.169.254/' + version + '/meta-data/' + endpoint;

        http.get(url, function(res) {
          var string = '';
          res.setEncoding('utf8');
          res.on('data', function(chunk) {
            string += chunk;
          });
          res.on('end', function() {
            if (res.statusCode == 200) {
              return callback(null, string);
            } else {
              return callback(new Error('HTTP ' + res.statusCode +
                ' when fetching credentials from EC2 API'));
            }
          });
        })
        .once('error', callback)
        .setTimeout(1000, callback);
      }
    }
  }
}
