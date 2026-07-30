const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const {
  register,
  login,
  resetPassword,
  createStaff,
  createCustomerAccount,
  getAgents,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);

router.post("/create-staff", authenticate, authorize("ADMIN"), createStaff);
router.post("/create-customer", authenticate, authorize("ADMIN", "AGENT"), createCustomerAccount);
router.get("/agents", authenticate, authorize("ADMIN"), getAgents);

module.exports = router;