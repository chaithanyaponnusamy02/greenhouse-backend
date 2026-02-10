const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GreenActivity = sequelize.define("green_activities", {
  activity_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING(200),
  category: DataTypes.STRING(100),
  description: DataTypes.TEXT,
  activity_date: DataTypes.DATE,
  faculty_id: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'green_activities'

});

module.exports = GreenActivity;
