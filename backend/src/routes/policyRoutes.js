const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/policyController");

router.use(authenticate);

router.get("/", ctrl.getPolicies);
router.get("/:id", ctrl.getPolicyById);

router.post("/apply", authorize("CUSTOMER"), ctrl.applyForPolicy);
router.post("/", authorize("ADMIN", "AGENT"), ctrl.createPolicyForCustomer);

router.put("/:id/status", authorize("ADMIN"), ctrl.updatePolicyStatus);
router.put("/:id/renew", authorize("ADMIN", "AGENT"), ctrl.renewPolicy);
router.put("/:id/cancel", authorize("ADMIN", "AGENT"), ctrl.cancelPolicy);

module.exports = router;