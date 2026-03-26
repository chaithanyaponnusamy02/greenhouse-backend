const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Report = sequelize.define("reports", {
  report_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  generated_by: DataTypes.INTEGER,
  report_title: DataTypes.STRING(255),
  report_type: {
    type: DataTypes.ENUM("Monthly", "Annual"),
    defaultValue: "Monthly"
  },
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  total_score: DataTypes.INTEGER,
  activities_count: DataTypes.INTEGER,
  certification_grade: DataTypes.STRING(50),
  report_path: DataTypes.STRING(255),
  status: {
    type: DataTypes.ENUM("Generated", "Downloaded"),
    defaultValue: "Generated"
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  generated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = Report;
