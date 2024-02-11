const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
  url: process.env.REDIS_URL,
  retry_strategy: function(options) {
    if (options.attempt > 10) {
      // Stop retrying after 10 attempts
      return undefined;
    }
    // Wait 2 seconds before retrying
    return 2000;
  }
});

client.on('error', function (err) {
  throw err;
});

client.connect();

module.exports = client;
