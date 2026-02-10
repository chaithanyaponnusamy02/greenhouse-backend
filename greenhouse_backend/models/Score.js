const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Score = sequelize.define("scores", {
  score_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  activity_id: DataTypes.INTEGER,
  auditor_id: DataTypes.INTEGER,
  score: DataTypes.INTEGER,
  criteria: DataTypes.STRING(100),
  scored_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = Score;
