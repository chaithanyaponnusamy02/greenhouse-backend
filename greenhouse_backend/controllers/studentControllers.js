const User = require("../models/User");
const GreenActivity = require("../models/GreenActivity");
const ActivityDocument = require("../models/ActivityDocument");
const Evaluation = require("../models/Evaluation");
const Score = require("../models/Score");
const StudentParticipation = require("../models/StudentParticipation");
const Notification = require("../models/Notification");
const fs = require("fs");
const path = require("path");

// ----------------------------
// 1️⃣ GET Profile
// ----------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
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
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) user.password = password;
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
    const activities = await GreenActivity.find({ status: "approved" })
      .populate('faculty_id', 'name email')
      .sort({ created_at: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities", error });
  }
};

// ----------------------------
// 3.1️⃣ GET All Activities
// ----------------------------
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.find({})
      .populate('faculty_id', 'name email')
      .sort({ created_at: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all activities", error });
  }
};

// ----------------------------
// 4️⃣ GET Activity by ID
// ----------------------------
exports.getActivityById = async (req, res) => {
  try {
    const activity = await GreenActivity.findOne({ _id: req.params.id, status: "approved" })
      .populate('faculty_id', 'name email');
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
    const activity = await GreenActivity.findById(req.params.activityId);
    if (!activity ) {
      return res.status(404).json({ message: "Activity not available" });
    }

    const existing = await StudentParticipation.findOne({
      activity_id: activity._id,
      student_id: req.user.id
    });

    if (existing) return res.status(400).json({ message: "Already participated" });

    const participation = new StudentParticipation({
      activity_id: activity._id,
      student_id: req.user.id,
      participation_date: new Date()
    });
    await participation.save();

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
    const participations = await StudentParticipation.find({ student_id: req.user.id }).populate('activity_id');
    res.json(participations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching my activities", error });
  }
};

// ----------------------------
// 7️⃣ GET My Score
// ----------------------------
exports.getMyScore = async (req, res) => {
  try {
    const participations = await StudentParticipation.find({ student_id: req.user.id }).select("activity_id");
    const activityIds = participations.map((p) => p.activity_id);

    if (activityIds.length === 0) {
      return res.json({ totalScore: 0 });
    }

    const result = await Score.aggregate([
      { $match: { activity_id: { $in: activityIds } } },
      { $group: { _id: null, total: { $sum: "$score" } } }
    ]);

    const totalScore = result.length > 0 ? result[0].total : 0;
    res.json({ totalScore });
  } catch (error) {
    res.status(500).json({ message: "Error fetching score", error });
  }
};

// ----------------------------
// 8️⃣ GET Dashboard
// ----------------------------
exports.getDashboard = async (req, res) => {
  try {
    const participationCount = await StudentParticipation.countDocuments({ student_id: req.user.id });
    const participations = await StudentParticipation.find({ student_id: req.user.id }).select("activity_id");
    const activityIds = participations.map((p) => p.activity_id);

    let totalScore = 0;
    if (activityIds.length > 0) {
      const scoreResult = await Score.aggregate([
        { $match: { activity_id: { $in: activityIds } } },
        { $group: { _id: null, total: { $sum: "$score" } } }
      ]);
      totalScore = scoreResult.length > 0 ? scoreResult[0].total : 0;
    }

    res.json({ totalActivities: participationCount, totalScore });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard", error });
  }
};

// ----------------------------
// 9️⃣ POST Upload Proof
// ----------------------------
exports.uploadProofDocument = async (req, res) => {
  try {
    const { activityId } = req.params;
    if (!req.file) return res.status(400).json({ message: "File required" });

    const doc = new ActivityDocument({
      activity_id: activityId,
      file_path: req.file.path
    });
    await doc.save();

    res.status(201).json({ message: "Document uploaded", doc });
  } catch (error) {
    res.status(500).json({ message: "Error uploading document", error });
  }
};

// ----------------------------
// 10️⃣ GET My Documents
// ----------------------------
exports.getMyDocuments = async (req, res) => {
  try {
    const docs = await ActivityDocument.find().populate('activity_id');
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching documents", error });
  }
};

// ----------------------------
// 11️⃣ GET Notifications
// ----------------------------
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// ----------------------------
// 12️⃣ PATCH Mark Notification Read
// ----------------------------
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user_id: req.user.id });

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.is_read = true;
    await notification.save();

    res.json({ message: "Notification marked read", notification });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error });
  }
};

// ----------------------------
// 13️⃣ POST Feedback
// ----------------------------
exports.submitFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
};

// ----------------------------
// 14️⃣ GET My Feedback
// ----------------------------
exports.getMyFeedback = async (req, res) => {
  try {
    res.json({ message: "No feedback yet", feedback: [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
};

// ----------------------------
// 15️⃣ GET Certification Status
// ----------------------------
exports.getCertificationStatus = async (req, res) => {
  try {
    res.json({ message: "No certification yet", certification: null });
  } catch (error) {
    res.status(500).json({ message: "Error fetching certification", error });
  }
};

// ----------------------------
// 16️⃣ GET Download Certificate
// ----------------------------
exports.downloadCertificate = async (req, res) => {
  try {
    res.status(404).json({ message: "Certificate not found" });
  } catch (error) {
    res.status(500).json({ message: "Error downloading certificate", error });
  }
};

// ----------------------------
// 17️⃣ GET My Activity Evaluations (Detailed Results)
// ----------------------------
exports.getMyActivityEvaluationsDetailed = async (req, res) => {
  try {
    const participations = await StudentParticipation.find({ student_id: req.user.id });
    const activityIds = participations.map((p) => p.activity_id);

    if (activityIds.length === 0) {
      return res.json({
        totalEvaluations: 0,
        evaluations: []
      });
    }

    const evaluations = await Evaluation.find({ activity_id: { $in: activityIds } })
      .populate({
        path: "activity_id",
        select: "title description category faculty_id status created_at",
        populate: {
          path: "faculty_id",
          select: "name email"
        }
      })
      .populate({
        path: "auditor_id",
        select: "name email"
      })
      .sort({ evaluated_at: -1 });

    const scores = await Score.find({ activity_id: { $in: activityIds } });
    const scoreMap = {};
    scores.forEach((score) => {
      const key = score.activity_id.toString();
      if (!scoreMap[key]) scoreMap[key] = [];
      scoreMap[key].push(score);
    });

    const formattedResults = evaluations.map((evaluation) => {
      const activityScores = scoreMap[evaluation.activity_id._id.toString()] || [];
      const totalScore = activityScores.reduce((sum, s) => sum + s.score, 0);
      const avgScore = activityScores.length > 0 ? Math.round(totalScore / activityScores.length) : 0;

      return {
        id: evaluation.activity_id._id,
        title: evaluation.activity_id.title,
        description: evaluation.activity_id.description,
        category: evaluation.activity_id.category,
        submissionDate: evaluation.activity_id.created_at,
        evaluationDate: evaluation.evaluated_at,
        faculty: {
          name: evaluation.activity_id.faculty_id?.name || "Unknown",
          email: evaluation.activity_id.faculty_id?.email
        },
        auditor: {
          name: evaluation.auditor_id?.name || "Unknown",
          email: evaluation.auditor_id?.email
        },
        status: evaluation.decision === "approved" ? "Approved" : "Rejected",
        decision: evaluation.decision,
        score: avgScore,
        remarks: evaluation.remarks,
        rejectionReason: evaluation.decision === "rejected" ? evaluation.remarks : null
      };
    });

    res.json({
      totalEvaluations: formattedResults.length,
      evaluations: formattedResults
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching evaluations", error: error.message });
  }
};
