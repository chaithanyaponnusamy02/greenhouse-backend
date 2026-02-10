const express = require("express");
const cors = require("cors");
require("dotenv").config();

const  sequelize  = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

sequelize.sync()
  .then(() => console.log("Database connected"))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
