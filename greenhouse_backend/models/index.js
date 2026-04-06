const User = require("./User");
const GreenActivity = require("./GreenActivity");
const ActivityDocument = require("./ActivityDocument");
const Evaluation = require("./Evaluation");
const Score = require("./Score");
const StudentParticipation = require("./StudentParticipation");
const Notification = require("./Notification");
const Report = require("./Report");

// MongoDB relationships are handled through references in schemas
// No need for explicit relationship definitions like Sequelize
// Queries can use populate() to fetch related documents

module.exports = {
  User,
  GreenActivity,
  ActivityDocument,
  Evaluation,
  Score,
  StudentParticipation,
  Notification,
  Report
};
