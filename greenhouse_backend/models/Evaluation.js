const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema({
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
  decision: {
    type: String,
    enum: ["approved", "rejected"]
  },
  remarks: String,
  score: Number,
  evaluated_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

module.exports = mongoose.model("activity_evaluations", evaluationSchema);
