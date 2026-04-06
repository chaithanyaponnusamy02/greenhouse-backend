const mongoose = require("mongoose");

const activityDocumentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  activity_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "green_activities"
  },
  file_path: {
    type: String,
    maxLength: 255
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

module.exports = mongoose.model("activity_documents", activityDocumentSchema);
