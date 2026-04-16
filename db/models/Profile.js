// src/models/Profile.js
const mongoose = require('mongoose');

// A "schema" is a blueprint that defines what each profile
// document looks like in your MongoDB collection
const profileSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },      // UUID v7
    name: { type: String, required: true, unique: true },    // lowercase name
    gender: { type: String },                                // "male" or "female"
    gender_probability: { type: Number },                    // e.g. 0.99
    sample_size: { type: Number },                           // "count" from Genderize
    age: { type: Number },                                   // predicted age
    age_group: { type: String },                             // child/teenager/adult/senior
    country_id: { type: String },                            // e.g. "NG"
    country_probability: { type: Number },                   // e.g. 0.85
    created_at: { type: String },                            // ISO 8601 UTC timestamp
  },
  {
    versionKey: false, // removes the __v field MongoDB adds by default
  }
);

// The first argument 'Profile' becomes the collection name 'profiles' in MongoDB
module.exports = mongoose.model('Profile', profileSchema);