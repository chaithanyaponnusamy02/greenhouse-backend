const mongoose = require("mongoose");

const greenActivitySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  title: {
    type: String,
    maxLength: 200
  },
  category: {
    type: String,
    maxLength: 100
  },
  description: String,
  activity_date: Date,
  faculty_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

module.exports = mongoose.model("green_activities", greenActivitySchema);
