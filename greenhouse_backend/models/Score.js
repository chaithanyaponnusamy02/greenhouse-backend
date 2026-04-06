const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  activity_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "green_activities"
  },
  auditor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  score: Number,
  criteria: {
    type: String,
    maxLength: 100
  },
  scored_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

module.exports = mongoose.model("scores", scoreSchema);
