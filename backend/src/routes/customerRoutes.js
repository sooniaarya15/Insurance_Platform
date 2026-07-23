const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/customerController");

router.use(authenticate);

router.get("/", ctrl.getCustomers);
router.get("/:id", ctrl.getCustomerById);
router.post("/", authorize("ADMIN", "AGENT"), ctrl.createCustomer);
router.put("/:id", authorize("ADMIN", "AGENT"), ctrl.updateCustomer);
router.delete("/:id", authorize("ADMIN"), ctrl.deleteCustomer);

module.exports = router;