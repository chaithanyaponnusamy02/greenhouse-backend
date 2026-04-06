const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  name: {
    type: String,
    maxLength: 100
  },
  email: {
    type: String,
    maxLength: 100,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    maxLength: 255
  },
  role: {
    type: String,
    enum: ["admin", "faculty", "auditor", "student"]
  },
  department: {
    type: String,
    maxLength: 100
  },
  auditor_id: {
    type: String,
    maxLength: 50,
    default: null
  },
  joined_date: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, { timestamps: false });

module.exports = mongoose.model("users", userSchema);
