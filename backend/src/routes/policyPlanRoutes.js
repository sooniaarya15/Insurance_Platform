const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/policyPlanController");

router.use(authenticate);

router.get("/", ctrl.getPlans); // everyone logged in can browse plans
router.post("/", authorize("ADMIN"), ctrl.createPlan);
router.put("/:id", authorize("ADMIN"), ctrl.updatePlan);
router.delete("/:id", authorize("ADMIN"), ctrl.deletePlan);

module.exports = router;