const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const ctrl = require("../controllers/paymentController");

router.use(authenticate);

router.get("/", ctrl.getPayments);
router.get("/overdue", ctrl.getOverdueAlerts);
router.post("/", ctrl.recordPayment);

module.exports = router;