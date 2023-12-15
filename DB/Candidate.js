const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  vote: Number,
});

module.exports = mongoose.model("Candidate", userSchema);
