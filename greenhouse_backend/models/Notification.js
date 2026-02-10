const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define("notifications", {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: DataTypes.INTEGER,
  message: DataTypes.TEXT,
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = Notification;
