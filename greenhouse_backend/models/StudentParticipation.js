const mongoose = require("mongoose");

const studentParticipationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  activity_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "green_activities"
  },
  participation_date: Date
}, { timestamps: false });

module.exports = mongoose.model("student_participation", studentParticipationSchema);
