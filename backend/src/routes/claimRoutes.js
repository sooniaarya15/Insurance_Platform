const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/claimController");

router.use(authenticate);

router.get("/", ctrl.getClaims);
router.get("/:id", ctrl.getClaimById);
router.post("/", ctrl.submitClaim);
router.put("/:id/status", authorize("ADMIN", "AGENT"), ctrl.updateClaimStatus);

module.exports = router;