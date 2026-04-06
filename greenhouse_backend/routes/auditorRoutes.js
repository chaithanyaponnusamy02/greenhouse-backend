const express = require("express");
const router = express.Router();
const auditorController = require("../controllers/auditorControllers");
const { authenticateJWT, authorizeRoles } = require("../middleware/authMiddleware");

router.use(authenticateJWT);
router.use(authorizeRoles("auditor"));

router.get("/activities/pending", auditorController.getPendingActivities);
router.get("/activities/:id", auditorController.getActivityDetails);
router.post("/activities/:id/evaluate", auditorController.evaluateActivity);
router.post("/activities/:id/score", auditorController.assignScore);
router.get("/activities/evaluated", auditorController.getEvaluatedActivities);
router.get("/my-evaluations", auditorController.getMyEvaluations);
router.get("/dashboard", auditorController.getDashboard);
router.get("/profile", auditorController.getMyProfile);
router.get("/activities/filter", auditorController.filterActivities);
router.get("/notifications", auditorController.getNotifications);
router.patch("/notifications/:id/read", auditorController.markNotificationRead);
router.get("/export-report", auditorController.exportReport);

module.exports = router;
