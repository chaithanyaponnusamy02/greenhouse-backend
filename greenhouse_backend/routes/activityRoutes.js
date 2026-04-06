const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityControllers");
const { authenticateJWT, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.use(authenticateJWT);
router.use(authorizeRoles("faculty"));

router.post("/", activityController.createActivity);
router.get("/profile", activityController.getProfile);
router.get("/my", activityController.getMyActivities);
router.get("/performance", activityController.getPerformanceSummary);
router.get("/:id", activityController.getSingleActivity);
router.put("/:id", activityController.updateActivity);
router.delete("/:id", activityController.deleteActivity);

router.post("/upload/:id", upload.single("file"), activityController.uploadDocument);
router.get("/documents/:id", activityController.getActivityDocuments);
router.delete("/documents/:docId", activityController.deleteDocument);

router.get("/dashboard", activityController.getDashboard);

module.exports = router;
