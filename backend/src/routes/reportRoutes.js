const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/reportController");

router.use(authenticate);
router.get("/dashboard", authorize("ADMIN", "AGENT"), ctrl.getDashboardStats);

module.exports = router;