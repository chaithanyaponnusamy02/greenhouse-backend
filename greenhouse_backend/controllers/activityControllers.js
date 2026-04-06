const User = require("../models/User");
const GreenActivity = require("../models/GreenActivity");
const ActivityDocument = require("../models/ActivityDocument");
const Score = require("../models/Score");
const ActivityEvaluation = require("../models/Evaluation");
const fs = require("fs");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { title, category, description, activity_date } = req.body;
    if (!title || !category || !description || !activity_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const activity = new GreenActivity({
      title,
      category,
      description,
      activity_date,
      faculty_id: req.user.id
    });
    await activity.save();

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMyActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.find({ faculty_id: req.user.id }).sort({ created_at: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSingleActivity = async (req, res) => {
  try {
    const activity = await GreenActivity.findOne({ _id: req.params.id, faculty_id: req.user.id });

    if (!activity) return res.status(404).json({ message: "Activity not found" });

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await GreenActivity.findById(req.params.id);

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.status !== "pending") return res.status(400).json({ message: "Cannot edit approved/rejected activity" });
    if (String(activity.faculty_id) !== String(req.user.id)) return res.status(403).json({ message: "Not your activity" });

    Object.assign(activity, req.body);
    await activity.save();
    res.status(200).json({ message: "Activity updated successfully", activity });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await GreenActivity.findById(req.params.id);

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.status !== "pending") return res.status(400).json({ message: "Cannot delete approved/rejected activity" });
    if (String(activity.faculty_id) !== String(req.user.id)) return res.status(403).json({ message: "Not your activity" });

    await GreenActivity.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const activity = await GreenActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (String(activity.faculty_id) !== String(req.user.id)) return res.status(403).json({ message: "Not your activity" });

    const document = new ActivityDocument({
      activity_id: req.params.id,
      file_path: req.file.path
    });
    await document.save();

    res.status(201).json({ message: "Document uploaded", document });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getActivityDocuments = async (req, res) => {
  try {
    const documents = await ActivityDocument.find({ activity_id: req.params.id });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await ActivityDocument.findById(req.params.docId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    const activity = await GreenActivity.findById(document.activity_id);
    if (String(activity.faculty_id) !== String(req.user.id)) return res.status(403).json({ message: "Not your activity" });

    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    await ActivityDocument.findByIdAndDelete(req.params.docId);
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const totalActivities = await GreenActivity.countDocuments({ faculty_id: facultyId });
    const pending = await GreenActivity.countDocuments({ faculty_id: facultyId, status: "pending" });
    const approved = await GreenActivity.countDocuments({ faculty_id: facultyId, status: "approved" });
    const rejected = await GreenActivity.countDocuments({ faculty_id: facultyId, status: "rejected" });

    res.status(200).json({ totalActivities, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPerformanceSummary = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const activities = await GreenActivity.find({ faculty_id: facultyId });
    const activityIds = activities.map((activity) => activity._id);
    const approvedCount = activities.filter((activity) => activity.status === "approved").length;

    if (activityIds.length === 0) {
      return res.status(200).json({
        totalScore: 0,
        averageScore: 0,
        highestScore: 0,
        categoryPerformance: [],
        activityScores: [],
        insights: {
          title: "No performance data yet",
          message: "You have not created any activities yet. Start by submitting a green initiative."
        },
        totalContribution: "0 approved activities contributing to campus sustainability"
      });
    }

    const scores = await Score.find({ activity_id: { $in: activityIds } }).populate("activity_id");
    const evaluations = await ActivityEvaluation.find({ activity_id: { $in: activityIds } });

    const totalScore = scores.reduce((sum, item) => sum + (item.score || 0), 0);
    const scoreCount = scores.length;
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    const highestScore = scoreCount > 0 ? Math.max(...scores.map((item) => item.score || 0)) : 0;

    const categoryMap = {};
    scores.forEach((item) => {
      const category = item.activity_id?.category || "Uncategorized";
      if (!categoryMap[category]) {
        categoryMap[category] = { category, activitySet: new Set(), totalScore: 0, count: 0 };
      }
      categoryMap[category].activitySet.add(String(item.activity_id._id));
      categoryMap[category].totalScore += item.score || 0;
      categoryMap[category].count += 1;
    });

    const categoryPerformance = Object.values(categoryMap).map((entry) => ({
      category: entry.category,
      activities: entry.activitySet.size,
      avgScore: entry.count > 0 ? Math.round(entry.totalScore / entry.count) : 0
    }));

    const activityScores = scores
      .sort((a, b) => new Date(b.scored_at) - new Date(a.scored_at))
      .map((item) => {
        const activity = item.activity_id;
        const evaluation = evaluations.find((evalDoc) => String(evalDoc.activity_id) === String(item.activity_id._id));
        return {
          title: activity?.title || "Untitled activity",
          category: activity?.category || "Uncategorized",
          date: activity?.activity_date ? activity.activity_date.toISOString().split("T")[0] : null,
          remarks: evaluation?.remarks || "No remarks available",
          score: item.score || 0
        };
      });

    const insights = averageScore >= 85
      ? {
        title: "Strong Performance",
        message: `Your average score of ${averageScore} indicates excellent execution of green initiatives`
      }
      : averageScore >= 70
      ? {
        title: "Good Performance",
        message: `Your average score of ${averageScore} indicates solid execution with some room for improvement`
      }
      : {
        title: "Performance Improvement Recommended",
        message: `Your average score of ${averageScore} indicates more focus is needed on activity execution`
      };

    res.status(200).json({
      totalScore,
      averageScore,
      highestScore,
      categoryPerformance,
      activityScores,
      insights,
      totalContribution: `${approvedCount} approved activities contributing to campus sustainability`
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
