const GreenActivity = require("../models/GreenActivity");
const ActivityDocument = require("../models/ActivityDocument");
const ActivityEvaluation = require("../models/Evaluation");
const Score = require("../models/Score");
const Notification = require("../models/Notification");
const User = require("../models/User");
const fs = require("fs");

exports.getPendingActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.find({ status: "pending" })
      .populate('faculty_id', 'name email')
      .sort({ created_at: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getActivityDetails = async (req, res) => {
  try {
    const activity = await GreenActivity.findById(req.params.id)
      .populate('faculty_id', 'name email');
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.evaluateActivity = async (req, res) => {
  try {
    const {  remarks } = req.body;

    const activity = await GreenActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.status !== "pending") return res.status(400).json({ message: "Already evaluated" });

    activity.status = "completed";
    await activity.save();

    const evaluation = new ActivityEvaluation({
      activity_id: req.params.id,
      auditor_id: req.user.id,
      remarks: remarks || "",
    });
    await evaluation.save();

    res.status(200).json({ message: "Activity evaluated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.assignScore = async (req, res) => {
  try {
    const { score, criteria } = req.body;
    if (score === undefined || !criteria) return res.status(400).json({ message: "Score and criteria are required" });

    const activity = await GreenActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const scoreDoc = new Score({
      activity_id: req.params.id,
      auditor_id: req.user.id,
      score,
      criteria,
    });
    await scoreDoc.save();

    activity.status = "approved";
    await activity.save();

    res.status(200).json({ message: "Score assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getEvaluatedActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.find({ status: { $in: ["approved", "rejected"] } }).sort({ created_at: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMyEvaluations = async (req, res) => {
  try {
    const evaluations = await ActivityEvaluation.find({ auditor_id: req.user.id }).populate('activity_id');
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const totalPending = await GreenActivity.countDocuments({ status: "pending" });
    const totalApproved = await GreenActivity.countDocuments({ status: "approved" });
    const totalRejected = await GreenActivity.countDocuments({ status: "rejected" });
    
    const scoreResult = await Score.aggregate([
      { $match: { auditor_id: req.user.id } },
      { $group: { _id: null, total: { $sum: "$score" } } }
    ]);
    const totalScoresGiven = scoreResult.length > 0 ? scoreResult[0].total : 0;

    res.status(200).json({
      totalPending,
      totalApproved,
      totalRejected,
      totalScoresGiven,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      name: user.name,
      role: user.role,
      email: user.email,
      department: user.department || null,
      auditorId: user._id || null,
      joinedDate: user.joined_date ? user.joined_date.toISOString().split("T")[0] : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.filterActivities = async (req, res) => {
  try {
    const { status, category, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (startDate && endDate) {
      filter.activity_date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const activities = await GreenActivity.find(filter)
      .populate('faculty_id', 'name email')
      .sort({ created_at: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.is_read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.exportReport = async (req, res) => {
  try {
    res.status(200).json({ message: "Export report API – implement PDF/Excel generation" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.is_read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.exportReport = async (req, res) => {
  try {
    res.status(200).json({ message: "Export report API – implement PDF/Excel generation" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
