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
Evaluation.belongsTo(GreenActivity, { foreignKey: "activity_id", as: "activity" });
User.hasMany(Evaluation, { foreignKey: "auditor_id" });
Evaluation.belongsTo(User, { foreignKey: "auditor_id", as: "auditor" });

// green_activities → scores
GreenActivity.hasMany(Score, { foreignKey: "activity_id" });
Score.belongsTo(GreenActivity, { foreignKey: "activity_id" });
User.hasMany(Score, { foreignKey: "auditor_id" });
Score.belongsTo(User, { foreignKey: "auditor_id" });

// students → participation
User.hasMany(StudentParticipation, { foreignKey: "student_id" });
GreenActivity.hasMany(StudentParticipation, { foreignKey: "activity_id" });
StudentParticipation.belongsTo(User, { foreignKey: "student_id", as: "student" });
StudentParticipation.belongsTo(GreenActivity, { foreignKey: "activity_id" });

// users → notifications
User.hasMany(Notification, { foreignKey: "user_id" });

// users → reports
User.hasMany(Report, { foreignKey: "generated_by" });
Report.belongsTo(User, { foreignKey: "generated_by", as: "generatedBy" });

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
