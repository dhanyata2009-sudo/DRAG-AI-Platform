const dns = require("dns");

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const connectDB = require("./config/db");
const scriptRoutes = require("./routes/scriptRoutes");
const authRoutes = require("./routes/authRoutes");
const avatarRoutes = require("./routes/avatarRoutes");
const adPipelineRoutes = require("./routes/adPipelineRoutes");
const presentationRoutes = require("./routes/presentationRoutes");
const projectRoutes = require("./routes/projectRoutes");
const historyRoutes = require("./routes/historyRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/generated", express.static(path.join(__dirname, "generated")));


connectDB();



app.use("/api/auth", authRoutes);
app.use("/api/avatars", avatarRoutes);
app.use("/api/scripts", scriptRoutes);
app.use("/api/ad-pipeline", adPipelineRoutes);
app.use("/api/presentations", presentationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);



app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend connected successfully!"
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});