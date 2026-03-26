const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Evaluation = sequelize.define("activity_evaluations", {
  evaluation_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  activity_id: DataTypes.INTEGER,
  auditor_id: DataTypes.INTEGER,
  decision: {
    type: DataTypes.ENUM("approved", "rejected")
  },
  remarks: DataTypes.TEXT,
  score: DataTypes.INTEGER,
  evaluated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = Evaluation;
