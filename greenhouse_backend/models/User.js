const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("users", {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING(100),
  email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  password: DataTypes.STRING(255),
  role: {
    type: DataTypes.ENUM("admin", "faculty", "auditor", "student")
  },
  department: DataTypes.STRING(100),
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active"
  }
}, {
  timestamps: false
});

module.exports = User;
