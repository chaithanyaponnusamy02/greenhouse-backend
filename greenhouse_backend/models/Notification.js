const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  message: String,
  is_read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

module.exports = mongoose.model("notifications", notificationSchema);
