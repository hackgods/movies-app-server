const express = require("express");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
require("dotenv").config();
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("./models/User");
const jwt = require("jsonwebtoken");


//home of users api

router.get("/", (req, res) => {
    res.send("Hello -User");
});


router.post("/register", async (req, res) => {
    try {
      const { firstName, lastName, email, password, profileEmoji, ip } = req.body;
  
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      //create users id
      const generateRandom10DigitNumber = () => Math.floor(Math.random() * 9e9) + 1e9;

      const uid = generateRandom10DigitNumber();

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // Create a new user
      const newUser = new User({
        uid,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        profileEmoji,
        ip,
        moviesWatched: [],
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ result: null });
      }
  
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ result: null });
      }
  
      // If credentials are valid, generate a token
    const token = jwt.sign(
      { userId: user.uid, email: user.email },
      process.env.KEY,
      { expiresIn: "1h" }
    );

      // If credentials are valid, return user object with uid
      const userObject = {
        name: user.firstName + " " + user.lastName,
        email: user.email,
        uid: user.uid,
        profileEmoji: user.profileEmoji,
        firstName: user.firstName,
        lastName: user.lastName,
      };
  
      res.status(200).json({ user: userObject, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization.split(" ")[1];

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.KEY);

    // Get the user ID from the decoded token
    const userId = decodedToken.userId;

    // Fetch the user details from the database using the user ID
    const user = await User.findOne({ uid: userId });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Set the user object in the request for further use
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fetch all user details using token
router.get("/details", verifyToken, async (req, res) => {
  try {
    // Return the user details
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/update", verifyToken, async (req, res) => {
  try {
    // Directly use req.user instead of fetching it again
    const user = req.user;

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Destructure values from req.body for brevity
    const { firstName, lastName, email, profileEmoji } = req.body;

    // Update the user details with the new values if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (profileEmoji) user.profileEmoji = profileEmoji;

    // Save the updated user details
    await user.save();

    // Return success message
    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update users password

router.put("/update-password", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    // Save the updated user details
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to add new movie IDs to moviesWatched
router.post("/watch-update", verifyToken, async (req, res) => {
  try {
    const { movieIds } = req.body;

    // Ensure movieIds is provided
    if (!movieIds || !Array.isArray(movieIds)) {
      return res.status(400).json({ error: "Invalid movieIds provided" });
    }

    // Get the user from the verified token
    const user = req.user;

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add new movie IDs to moviesWatched array
    user.moviesWatched.push(...movieIds);

    // Save the updated user details
    await user.save();

    // Return success message
    res.status(200).json({ message: "Movies added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;