const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Report = sequelize.define("reports", {
  report_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  generated_by: DataTypes.INTEGER,
  report_path: DataTypes.STRING(255),
  generated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = Report;
