const express = require('express');
const movieRoutes = require('./routes/movie.js');
const axios = require('axios'); // Import axios for sending requests
var bodyParser = require('body-parser');
require("dotenv").config();
const cors = require("cors");
const connection = require("./db.js");

//db connection
connection();

const app = express();
const PORT = process.env.PORT || 4000;
const apiDir = "/api/v1";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
    extended: true 
 }));
app.use(cors());



app.use(`${apiDir}/movies`,movieRoutes);


app.listen(PORT,function() {
    console.log(`Server started on ${PORT}`);
});

app.get("/",function(request, response) {
    response.send('Hello, welcome to Movies+ Server');
});

app.get(`${apiDir}`,function(request, response) {
    response.send('Hello, welcome to Movies+ Server');
});

// Function to send a traffic request to your server
async function sendTrafficRequest() {
    try {
      const response = await axios.get(`https://movies-app-server-ypl0.onrender.com`);
      console.log('Traffic request sent successfully', response.status);
    } catch (error) {
      console.error('Error sending traffic request', error.message);
    }
  }
  
  // Set an interval to send the request every 14 minutes (840,000 milliseconds)
  const interval = 14 * 60 * 1000;
  setInterval(sendTrafficRequest, interval);
