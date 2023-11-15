const express = require("express");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const router = express.Router();
require("dotenv").config();
const axios = require("axios");
const Movie = require("./models/Movie");
const AppData = require("./models/AppData");


const apiKey = process.env.KEY; // TMDB API key



//home of movies api
router.get("/", (req, res) => {
    res.send("Hello -User");
});


// Add a new slider to the appData collection
router.post('/add-slider', async (req, res) => {
    try {
      const { name, image, link } = req.body;
  
      // Create a new slider object
      const newSlider = {
        name,
        image,
        link,
      };
  
      // Find the appData document (assuming there's only one document)
      let appData = await AppData.findOne();
  
      // If no appData document exists, create one
      if (!appData) {
        appData = new AppData({
          sliders: [],
        });
      }
  
      // Add the new slider to the sliders array
      appData.sliders.push(newSlider);
  
      // Save the updated appData document
      await appData.save();
  
      res.status(201).json({ message: 'Slider added successfully', slider: newSlider });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Fetch specified field or the entire appData document
router.get("/fetch", async (req, res) => {
    try {
      // For example, you might use an ID or some other unique identifier
      const appDataDocument = await AppData.findOne();
  
      if (!appDataDocument) {
        return res.status(404).json({ error: "AppData not found" });
      }
  
      // Extract the field name from the query parameters
      const fieldName = req.query.fieldName;
  
      // If a field name is specified, return only that field, otherwise return the entire document
      if (fieldName) {
        // Check if the specified field exists in the document
        if (appDataDocument[fieldName] !== undefined) {
          const fieldValue = appDataDocument[fieldName];
          return res.status(200).json({ [fieldName]: fieldValue });
        } else {
          return res.status(400).json({ error: "Field not found in the document" });
        }
      } else {
        // No field name specified, return the entire document
        return res.status(200).json(appDataDocument);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  
// Define a route to fetch all movies with id, title, posterPath, genres, voteAverage, and voteCount
router.get("/movies", async (req, res) => {
  try {
    // Use the Movie model to query the database for all movies
    const movies = await Movie.find({}, { _id: 0, id: 1, title: 1, posterPath: 1, genres: 1, voteAverage: 1, voteCount: 1 });

    // Calculate the weighted average for each movie
    const weightedMovies = movies.map(movie => {
      const weightedAverage = (movie.voteAverage * movie.voteCount) + 10; // Adjust the constant as needed
      return { ...movie.toObject(), weightedAverage };
    });

    // Sort movies based on the weighted average in descending order
    const rankedMovies = weightedMovies.sort((a, b) => b.weightedAverage - a.weightedAverage);

    // Send the list of movies with id, title, posterPath, genres, voteAverage, and voteCount as a JSON response
    res.json(rankedMovies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Define a route to fetch movie details by ID
router.get("/movies/:id", async (req, res) => {
    try {
      const movieId = req.params.id;
  
      // Use the Movie model to find a movie by ID in the database
      const movie = await Movie.findOne({ id: movieId }).exec();
  
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
  
      // Send the movie details as a JSON response
      res.json(movie);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }); 






module.exports = router;