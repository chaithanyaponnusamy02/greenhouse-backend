const GreenActivity = require("../models/GreenActivity");
const ActivityDocument = require("../models/ActivityDocument");
const ActivityEvaluation = require("../models/Evaluation");
const Score = require("../models/Score");
const Notification = require("../models/Notification");
const { Op } = require("sequelize");
const fs = require("fs");

exports.getPendingActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.findAll({
      where: { status: "pending" },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getActivityDetails = async (req, res) => {
  try {
    const activity = await GreenActivity.findByPk(req.params.id, {
      include: [ActivityDocument],
    });
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.evaluateActivity = async (req, res) => {
  try {
    const { decision, remarks } = req.body;
    if (!decision) return res.status(400).json({ message: "Decision is required" });

    const activity = await GreenActivity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.status !== "pending") return res.status(400).json({ message: "Already evaluated" });

    await activity.update({ status: decision });

    await ActivityEvaluation.create({
      activity_id: req.params.id,
      auditor_id: req.user.id,
      decision,
      remarks: remarks || "",
    });

    res.status(200).json({ message: "Activity evaluated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.assignScore = async (req, res) => {
  try {
    const { score, criteria } = req.body;
    if (score === undefined || !criteria) return res.status(400).json({ message: "Score and criteria are required" });

    const activity = await GreenActivity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.status !== "approved") return res.status(400).json({ message: "Only approved activities can be scored" });

    await Score.create({
      activity_id: req.params.id,
      auditor_id: req.user.id,
      score,
      criteria,
    });

    res.status(200).json({ message: "Score assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getEvaluatedActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.findAll({
      where: { status: ["approved", "rejected"] },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMyEvaluations = async (req, res) => {
  try {
    const evaluations = await ActivityEvaluation.findAll({
      where: { auditor_id: req.user.id },
      include: [GreenActivity],
    });
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const totalPending = await GreenActivity.count({ where: { status: "pending" } });
    const totalApproved = await GreenActivity.count({ where: { status: "approved" } });
    const totalRejected = await GreenActivity.count({ where: { status: "rejected" } });
    const totalScoresGiven = await Score.sum("score", { where: { auditor_id: req.user.id } });

    res.status(200).json({
      totalPending,
      totalApproved,
      totalRejected,
      totalScoresGiven: totalScoresGiven || 0,
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
    if (startDate && endDate) filter.activity_date = { [Op.between]: [startDate, endDate] };

    const activities = await GreenActivity.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(notifications);
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
