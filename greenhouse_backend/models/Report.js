const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  generated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  report_title: {
    type: String,
    maxLength: 255
  },
  report_type: {
    type: String,
    enum: ["Monthly", "Annual"],
    default: "Monthly"
  },
  start_date: Date,
  end_date: Date,
  total_score: Number,
  activities_count: Number,
  certification_grade: {
    type: String,
    maxLength: 50
  },
  report_path: {
    type: String,
    maxLength: 255
  },
  status: {
    type: String,
    enum: ["Generated", "Downloaded"],
    default: "Generated"
  },
  download_count: {
    type: Number,
    default: 0
  },
  generated_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

module.exports = mongoose.model("reports", reportSchema);
