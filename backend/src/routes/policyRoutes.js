const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/policyController");

router.use(authenticate);

router.get("/", ctrl.getPolicies);
router.get("/:id", ctrl.getPolicyById);
router.post("/", authorize("ADMIN", "AGENT"), ctrl.createPolicy);
router.put("/:id", authorize("ADMIN", "AGENT"), ctrl.updatePolicy);
router.put("/:id/renew", authorize("ADMIN", "AGENT"), ctrl.renewPolicy);
router.put("/:id/cancel", authorize("ADMIN", "AGENT"), ctrl.cancelPolicy);

module.exports = router;