const express = require("express");
const { login, logout, me, signup } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAllowedOrigin } = require("../middleware/csrfMiddleware");

const router = express.Router();

router.post("/signup", requireAllowedOrigin, signup);
router.post("/login", requireAllowedOrigin, login);
router.post("/logout", requireAllowedOrigin, logout);
router.get("/me", requireAuth, me);

module.exports = router;
