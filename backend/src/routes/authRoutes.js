const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { register, login, resetPassword, createStaff } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);

// Admin creates Agent/Admin accounts
router.post("/create-staff", authenticate, authorize("ADMIN"), createStaff);

module.exports = router;