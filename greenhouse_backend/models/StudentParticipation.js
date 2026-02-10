const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const StudentParticipation = sequelize.define("student_participation", {
  participation_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: DataTypes.INTEGER,
  activity_id: DataTypes.INTEGER,
  participation_date: DataTypes.DATE
}, {
  timestamps: false
});

module.exports = StudentParticipation;
