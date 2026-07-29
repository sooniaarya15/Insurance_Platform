const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/customerController");

router.use(authenticate);

// Customer's own profile
router.get("/me", authorize("CUSTOMER"), ctrl.getMyProfile);
router.put("/me", authorize("CUSTOMER"), ctrl.updateMyProfile);

// Admin/Agent manage all customers
router.get("/", authorize("ADMIN", "AGENT"), ctrl.getCustomers);
router.get("/:id", authorize("ADMIN", "AGENT"), ctrl.getCustomerById);
router.post("/", authorize("ADMIN", "AGENT"), ctrl.createCustomer);
router.put("/:id", authorize("ADMIN", "AGENT"), ctrl.updateCustomer);
router.delete("/:id", authorize("ADMIN"), ctrl.deleteCustomer);

module.exports = router;