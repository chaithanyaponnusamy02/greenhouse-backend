const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/db"); // <-- this must match the export

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const auditorRoutes = require("./routes/auditorRoutes");
const adminRoutes = require("./routes/adminRoutes");  
const activityRoutes = require("./routes/activityRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/auditor", auditorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activity", activityRoutes);

// Do not use alter in production if DB has many indexes (can produce Too many keys error).
// Run migrations separately or use sync() once after initial setup.
sequelize.authenticate()
  .then(() => {
    console.log("Database connected");
    return sequelize.sync({ alter: false });
  })
  .then(() => console.log("Database synced"))
  .catch(err => console.error("Database connection failed:", err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
