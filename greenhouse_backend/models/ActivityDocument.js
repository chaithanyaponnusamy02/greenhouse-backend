const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ActivityDocument = sequelize.define("activity_documents", {
  doc_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  activity_id: DataTypes.INTEGER,
  file_path: DataTypes.STRING(255),
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = ActivityDocument;
