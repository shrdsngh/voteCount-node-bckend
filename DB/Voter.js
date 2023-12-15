const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  voterEmail: String,
  votedFor: Number,
});

module.exports = mongoose.model("Voter", voterSchema);
