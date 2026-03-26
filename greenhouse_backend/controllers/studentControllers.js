const { Activity, ActivityDocument, Evaluation, Feedback, User, Notification, Certification } = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// ----------------------------
// 1️⃣ GET Profile
// ----------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// ----------------------------
// 2️⃣ PUT Profile
// ----------------------------
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) user.password = password; // hash in middleware
    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// ----------------------------
// 3️⃣ GET All Approved Activities
// ----------------------------
exports.getApprovedActivities = async (req, res) => {
  try {
    const activities = await Activity.findAll({
      where: { status: "approved" },
      order: [["createdAt", "DESC"]]
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities", error });
  }
};

// ----------------------------
// 4️⃣ GET Activity by ID
// ----------------------------
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      where: { id: req.params.id, status: "approved" }
    });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity", error });
  }
};

// ----------------------------
// 5️⃣ Participate in Activity (Mark participation)
// ----------------------------
exports.participateInActivity = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.activityId);
    if (!activity || activity.status !== "approved") {
      return res.status(404).json({ message: "Activity not available" });
    }

    const existing = await ActivityDocument.findOne({
      where: { activity_id: activity.id, uploaded_by: req.user.id }
    });

    if (existing) return res.status(400).json({ message: "Already participated" });

    const participation = await ActivityDocument.create({
      activity_id: activity.id,
      uploaded_by: req.user.id
    });

    res.status(201).json({ message: "Participation marked", participation });
  } catch (error) {
    res.status(500).json({ message: "Error participating", error });
  }
};

// ----------------------------
// 6️⃣ GET My Activities (participated)
// ----------------------------
exports.getMyActivities = async (req, res) => {
  try {
    const docs = await ActivityDocument.findAll({
      where: { uploaded_by: req.user.id },
      include: [{ model: Activity }]
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching my activities", error });
  }
};

// ----------------------------
// 7️⃣ GET My Score
// ----------------------------
exports.getMyScore = async (req, res) => {
  try {
    const score = await Evaluation.sum("score", { where: { student_id: req.user.id } });
    res.json({ totalScore: score || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching score", error });
  }
};

// ----------------------------
// 8️⃣ GET Dashboard
// ----------------------------
exports.getDashboard = async (req, res) => {
  try {
    const totalActivities = await Activity.count({ where: { status: "approved" } });
    const totalScore = await Evaluation.sum("score", { where: { student_id: req.user.id } });

    res.json({ totalActivities, totalScore: totalScore || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard", error });
  }
};

// ----------------------------
// 9️⃣ POST Feedback
// ----------------------------
exports.submitFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    const feedback = await Feedback.create({
      activity_id: req.params.activityId,
      user_id: req.user.id,
      message
    });
    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
};

// ----------------------------
// 10️⃣ GET My Feedback
// ----------------------------
exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Activity }]
    });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
};

// ----------------------------
// 11️⃣ GET Certification Status
// ----------------------------
exports.getCertificationStatus = async (req, res) => {
  try {
    const cert = await Certification.findOne({
      order: [["createdAt", "DESC"]]
    });
    res.json(cert || { message: "No certification yet" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching certification", error });
  }
};

// ----------------------------
// 12️⃣ GET Download Certificate
// ----------------------------
exports.downloadCertificate = async (req, res) => {
  try {
    const cert = await Certification.findOne({
      order: [["createdAt", "DESC"]]
    });

    if (!cert || !fs.existsSync(cert.file_path)) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.download(cert.file_path);
  } catch (error) {
    res.status(500).json({ message: "Error downloading certificate", error });
  }
};

// ----------------------------
// 13️⃣ GET Notifications
// ----------------------------
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// ----------------------------
// 14️⃣ PATCH Mark Notification Read
// ----------------------------
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.is_read = true;
    await notification.save();

    res.json({ message: "Notification marked read", notification });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error });
  }
};

// ----------------------------
// 15️⃣ POST Upload Proof
// ----------------------------
exports.uploadProofDocument = async (req, res) => {
  try {
    const { activityId } = req.params;
    if (!req.file) return res.status(400).json({ message: "File required" });

    const doc = await ActivityDocument.create({
      activity_id: activityId,
      uploaded_by: req.user.id,
      file_path: req.file.path
    });

    res.status(201).json({ message: "Document uploaded", doc });
  } catch (error) {
    res.status(500).json({ message: "Error uploading document", error });
  }
};


exports.getMyDocuments = async (req, res) => {
  try {
    const docs = await ActivityDocument.findAll({
      where: { uploaded_by: req.user.id },
      include: [{ model: Activity }]
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching documents", error });
  }
};
