const User = require("./User");
const GreenActivity = require("./GreenActivity");
const ActivityDocument = require("./ActivityDocument");
const Evaluation = require("./Evaluation");
const Score = require("./Score");
const StudentParticipation = require("./StudentParticipation");
const Notification = require("./Notification");
const Report = require("./Report");

// users → green_activities
User.hasMany(GreenActivity, { foreignKey: "faculty_id" });
GreenActivity.belongsTo(User, { foreignKey: "faculty_id" });

// green_activities → documents
GreenActivity.hasMany(ActivityDocument, { foreignKey: "activity_id" });

// green_activities → evaluations
GreenActivity.hasOne(Evaluation, { foreignKey: "activity_id" });
User.hasMany(Evaluation, { foreignKey: "auditor_id" });

// green_activities → scores
GreenActivity.hasOne(Score, { foreignKey: "activity_id" });
User.hasMany(Score, { foreignKey: "auditor_id" });

// students → participation
User.hasMany(StudentParticipation, { foreignKey: "student_id" });
GreenActivity.hasMany(StudentParticipation, { foreignKey: "activity_id" });

// users → notifications
User.hasMany(Notification, { foreignKey: "user_id" });

// users → reports
User.hasMany(Report, { foreignKey: "generated_by" });

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
