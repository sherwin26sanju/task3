const express = require("express");
const { signup, login, logout, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /auth/signup
 * Register a new user
 */
router.post("/signup", signup);

/**
 * POST /auth/login
 * Login user and get token
 */
router.post("/login", login);

/**
 * POST /auth/logout
 * Logout user and clear token cookie
 */
router.post("/logout", protect, logout);

/**
 * GET /auth/me
 * Get current logged-in user (protected)
 */
router.get("/me", protect, me);

module.exports = router;
