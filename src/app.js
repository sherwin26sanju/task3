const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");
const logger = require("./utils/logger");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser());
app.use(logger);

// Routes
app.use("/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
