const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminControllers");
const { authenticateJWT, authorizeRoles } = require("../middleware/authMiddleware");

router.use(authenticateJWT);
router.use(authorizeRoles("admin"));

router.get("/dashboard", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.patch("/users/:id/status", adminController.toggleUserStatus);
router.delete("/users/:id", adminController.deleteUser);

router.get("/activities", adminController.getAllActivities);
router.get("/activities/filter", adminController.filterActivities);
router.delete("/activities/:id", adminController.deleteActivity);

router.get("/evaluations", adminController.getAllEvaluations);
router.get("/evaluations/detailed", adminController.getAllEvaluationsDetailed);

router.get("/scores/total", adminController.getTotalScore);
router.get("/activities/summary", adminController.getActivitySummary);
router.post("/reports/generate", adminController.generateReport);
router.get("/reports", adminController.getAllReports);
router.patch("/reports/:id/download", adminController.downloadReport);

module.exports = router;
