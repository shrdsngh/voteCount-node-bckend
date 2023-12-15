const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const jwtKey = "voter";
const User = require("./DB/User");
const Candidate = require("./DB/Candidate");

const app = express();
const PORT = 4422;

const url =
  "mongodb+srv://<username>:<password>@cluster0.xony9ng.mongodb.net/?retryWrites=true&w=majority"; // use own <username> and <password> for mongodb connection
const dbName = "VotingCount";

app.use(express.json());
app.use(cors());

// Connecting to DB
mongoose
  .connect(url)
  .then(() => console.log("connected"))
  .catch(() => console.log("failed"));

// Register API
app.post("/register", async (req, res) => {
  const { username, password, email, contact, role } = req.body;
  const userDetail = {
    username: username,
    password: password,
    email: email,
    contact: contact,
    voted: false,
    role: role,
  };
  const email_exist = await User.findOne({ email: email });
  if (email_exist) {
    res.send({ message: "This Email is already in use !" });
  } else {
    const username_exist = await User.findOne({ username: username });
    if (username_exist) {
      res.send({ message: "This username is already taken !" });
    } else {
      User.create(userDetail).then((result, err) => {
        if (result) {
          res.send({ message: "User Created Successfully" });
        } else {
          res.status(500).send({ message: err.message });
        }
      });
    }
  }
});

// Login API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDetail = await User.findOne({ username: username });
  if (userDetail) {
    if (password === userDetail.password) {
      jwt.sign({ userDetail }, jwtKey, { expiresIn: 60 * 60 }, (err, token) => {
        if (err) {
          res.send("some error");
        }
        res.send({ userDetail, auth: token });
      });
    } else {
      res.send({ error: "Invalid Password" });
    }
  } else {
    res.send({ error: "user does not exist" });
  }
});

// Voting API :-
app.put("/voting/:email", async (req, res) => {
  const { voterEmail, votedFor } = req.body;

  const findVoter = await User.findOne({ email: voterEmail });
  if (findVoter.voted === true) {
    res.send({ message: "Already Voted!" });
  } else {
    // STEP 1 - Updating the user's voted as TRUE
    await User.updateOne({ email: voterEmail }, { $set: { voted: true } });

    // STEP 2 - Updating the vote count
    const findCandidate = await Candidate.findOne({
      name: `CANDIDATE ${votedFor}`,
    });
    const candidateVote = findCandidate.vote;
    await Candidate.updateOne(
      { name: `CANDIDATE ${votedFor}` },
      { $set: { vote: candidateVote + 1 } }
    );

    res.send({
      message: "Voting successful!",
    });
  }
});

// VoteCount API
app.get("/voteCount", async (req, res) => {
  const candidate1 = await Candidate.findOne({ name: "CANDIDATE 1" });
  const candidate1Vote = candidate1.vote;

  const candidate2 = await Candidate.findOne({ name: "CANDIDATE 2" });
  const candidate2Vote = candidate2.vote;

  const candidate3 = await Candidate.findOne({ name: "CANDIDATE 3" });
  const candidate3Vote = candidate3.vote;

  const candidate4 = await Candidate.findOne({ name: "CANDIDATE 4" });
  const candidate4Vote = candidate4.vote;

  const candidateVotes = {
    candidate1Vote: candidate1Vote,
    candidate2Vote: candidate2Vote,
    candidate3Vote: candidate3Vote,
    candidate4Vote: candidate4Vote,
  };
  res.send(candidateVotes);
});

// Check if voted already
app.post("/already-voted", async (req, res) => {
  const voterEmail = req.body.voterEmail;
  const voterDetail = await User.findOne({ email: voterEmail });
  if (voterDetail?.voted === true) {
    res.send({ voted: true });
  } else {
    res.send({ voted: false });
  }
});

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
