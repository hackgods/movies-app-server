const serverless = require('serverless-http')
const express = require('express');
const movieRoutes = require('./routes/movie.js');
var bodyParser = require('body-parser');
require("dotenv").config();
const cors = require("cors");
const connection = require("./db.js");

//db connection
connection();

const api = express();

router.get('/hello', (req, res) => res.send('Hello World!'));

api.use('/api/', movieRoutes);

export const handler = serverless(api);
