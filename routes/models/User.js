const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: Number,
    unique: true,
    required: true,
    minLength: 10,
  },
  firstName: {
    type: String,
    required: true,
    match: [/^[a-zA-Z\s]*$/, 'Invalid first name']
  },
  lastName: {
    type: String,
    require: true,
    match: [/^[a-zA-Z\s]*$/, 'Invalid last name']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  profileEmoji: {
    type: Number,
    required: true,
    default: 1
    },
  ip: {
    type: String,
    default: "0.0.0.0",
  },
  moviesWatched: {
    type: [Number],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const User = mongoose.model('User', userSchema);

module.exports = User;
