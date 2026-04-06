const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

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

// Connect to MongoDB
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
