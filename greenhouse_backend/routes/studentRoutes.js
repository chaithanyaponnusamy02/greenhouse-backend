const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentControllers");
const { authenticateJWT, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.use(authenticateJWT); 
router.use(authorizeRoles("student")); 

router.get("/profile", studentController.getProfile);

router.put("/profile", studentController.updateProfile);

router.get("/activities", studentController.getApprovedActivities);

router.get("/all-activities", studentController.getAllActivities);

router.get("/activities/:id", studentController.getActivityById);

router.post("/participate/:activityId", studentController.participateInActivity);

router.get("/my-activities", studentController.getMyActivities);

router.get("/my-score", studentController.getMyScore);

router.get("/dashboard", studentController.getDashboard);

router.get("/my-evaluations", studentController.getMyActivityEvaluationsDetailed);

router.post("/feedback/:activityId", studentController.submitFeedback);

router.get("/my-feedback", studentController.getMyFeedback);

router.get("/certification-status", studentController.getCertificationStatus);

router.get("/download-certificate", studentController.downloadCertificate);

router.get("/notifications", studentController.getNotifications);

router.patch("/notifications/:id/read", studentController.markNotificationRead);

router.post("/upload-proof/:activityId", upload.single("file"), studentController.uploadProofDocument);

router.get("/my-documents", studentController.getMyDocuments);

module.exports = router;
