const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: String,
  username: String,
  password: String,
  email: String,
  contact: Number,
  voted: Boolean,
  role: Number,
});

module.exports = mongoose.model("User", userSchema);
