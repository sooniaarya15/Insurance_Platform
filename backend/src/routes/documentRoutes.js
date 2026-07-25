const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");
const ctrl = require("../controllers/documentController");

router.use(authenticate);
router.post("/documents", upload.single("file"), ctrl.uploadDocument);
router.get("/documents", ctrl.getDocuments);

module.exports = router;