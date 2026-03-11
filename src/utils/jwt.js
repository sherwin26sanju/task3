const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "secret",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "secret");
};

module.exports = { generateToken, verifyToken };
