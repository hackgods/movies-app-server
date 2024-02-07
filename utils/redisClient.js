const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', function (err) {
  throw err;
});

client.connect();

module.exports = client;
