const User = require("../models/User");
const GreenActivity = require("../models/GreenActivity");
const Score = require("../models/Score");
const Report = require("../models/Report");
const Evaluation = require("../models/Evaluation");
const StudentParticipation = require("../models/StudentParticipation");
const bcrypt = require("bcryptjs");

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Total Score using aggregation
    const totalScoreResult = await Evaluation.aggregate([
      { $group: { _id: null, totalScore: { $sum: "$score" } } }
    ]);
    const totalScore = totalScoreResult[0]?.totalScore || 0;

    // Previous month total score
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const previousScoreResult = await Evaluation.aggregate([
      { $match: { evaluated_at: { $lt: lastMonth } } },
      { $group: { _id: null, totalScore: { $sum: "$score" } } }
    ]);
    const previousScore = previousScoreResult[0]?.totalScore || 1;
    const scorePercentageChange = ((totalScore - previousScore) / previousScore * 100).toFixed(1);

    // Total Activities
    const totalActivities = await GreenActivity.countDocuments();
    const previousActivities = await GreenActivity.countDocuments({
      created_at: { $lt: lastMonth }
    });
    const activitiesPercentageChange = previousActivities > 0 ? ((totalActivities - previousActivities) / previousActivities * 100).toFixed(1) : 0;

    // Total Users
    const totalUsers = await User.countDocuments();
    const usersPercentageChange = 0;

    // Activity Status Distribution
    const approvedCount = await GreenActivity.countDocuments({ status: 'approved' });
    const pendingCount = await GreenActivity.countDocuments({ status: 'pending' });
    const rejectedCount = await GreenActivity.countDocuments({ status: 'rejected' });

    // Score by Category
    const scoreByCategory = await GreenActivity.aggregate([
      { $group: { _id: "$category", totalScore: { $sum: 1 } } }
    ]);

    // Recent Activities (last 5)
    const recentActivities = await GreenActivity.find()
      .populate("faculty_id", "name")
      .sort({ created_at: -1 })
      .limit(5)
      .select("title category status activity_date");

    const formattedRecentActivities = recentActivities.map(activity => ({
      activity: activity.title,
      user: activity.user_id?.name || 'Unknown',
      category: activity.category,
      score: 0,
      status: activity.status
    }));

    res.status(200).json({
      totalScore: {
        value: totalScore,
        change: scorePercentageChange,
        label: 'Total Green Score'
      },
      totalActivities: {
        value: totalActivities,
        change: activitiesPercentageChange,
        label: 'Total Activities'
      },
      totalUsers: {
        value: totalUsers,
        change: usersPercentageChange,
        label: 'Total Users'
      },
      statusDistribution: {
        approved: {
          count: approvedCount,
          percentage: ((approvedCount / totalActivities) * 100).toFixed(1),
          label: 'Approved'
        },
        pending: {
          count: pendingCount,
          percentage: ((pendingCount / totalActivities) * 100).toFixed(1),
          label: 'Pending'
        },
        rejected: {
          count: rejectedCount,
          percentage: ((rejectedCount / totalActivities) * 100).toFixed(1),
          label: 'Rejected'
        }
      },
      scoreByCategory: scoreByCategory.map(cat => ({
        category: cat._id,
        score: cat.totalScore || 0
      })),
      recentActivities: formattedRecentActivities
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role, department });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    Object.assign(user, req.body);
    await user.save();
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggle user status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.is_active = !user.is_active;
    await user.save();
    res.status(200).json({ message: "User status updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.find()
      .populate("faculty_id", "name email")
      .sort({ created_at: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Filter activities
exports.filterActivities = async (req, res) => {
  try {
    const { status, category, faculty_id } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (faculty_id) filter.faculty_id = faculty_id;

    const activities = await GreenActivity.find(filter)
      .populate("faculty_id", "name email")
      .sort({ created_at: -1 });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete activity
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await GreenActivity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all evaluations
exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate("activity_id", "title")
      .populate("auditor_id", "name");
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get total score
exports.getTotalScore = async (req, res) => {
  try {
    const totalScoreResult = await Score.aggregate([
      { $group: { _id: null, totalScore: { $sum: "$score" } } }
    ]);
    const totalScore = totalScoreResult[0]?.totalScore || 0;

    res.status(200).json({ totalScore });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get activity summary
exports.getActivitySummary = async (req, res) => {
  try {
    const summary = await GreenActivity.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate report
exports.generateReport = async (req, res) => {
  try {
    const { report_type, start_date, end_date } = req.body;

    if (!report_type || !start_date || !end_date) {
      return res.status(400).json({ message: "Report type, start date, and end date are required" });
    }

    const evaluations = await Evaluation.find({
      evaluated_at: { $gte: new Date(start_date), $lte: new Date(end_date) }
    });

    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const averageScore = evaluations.length > 0 ? Math.round(totalScore / evaluations.length) : 0;
    const activitiesCount = await GreenActivity.countDocuments({
      created_at: { $gte: new Date(start_date), $lte: new Date(end_date) }
    });

    const certificationGrade = getCertificationGrade(averageScore);

    const report = new Report({
      generated_by: req.user.id,
      report_title: `Green Score Certification - ${new Date(end_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      report_type,
      start_date,
      end_date,
      total_score: totalScore,
      activities_count: activitiesCount,
      certification_grade: certificationGrade,
      report_path: `/reports/green-score-${Date.now()}.pdf`,
      status: "Generated"
    });
    await report.save();

    res.status(201).json({
      message: "Report generated successfully",
      report: {
        report_id: report._id,
        title: report.report_title,
        type: report.report_type,
        date: report.generated_at,
        total_score: report.total_score,
        activities: report.activities_count,
        grade: report.certification_grade,
        status: report.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("generated_by", "name").sort({ generated_at: -1 });

    const totalReportsGenerated = reports.length;
    const totalDownloads = reports.reduce((sum, r) => sum + r.download_count, 0);
    const lastReport = reports.length > 0 ? reports[0].generated_at : null;

    const formattedReports = reports.map(r => ({
      report_id: r._id,
      title: r.report_title,
      type: r.report_type,
      date: r.generated_at,
      total_score: r.total_score,
      activities: r.activities_count,
      status: r.status
    }));

    res.status(200).json({
      totalReportsGenerated,
      totalDownloads,
      lastReport,
      reports: formattedReports
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Download report
exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.download_count += 1;
    report.status = 'Downloaded';
    await report.save();

    res.status(200).json({
      message: "Report downloaded successfully",
      report: {
        report_id: report._id,
        title: report.report_title,
        path: report.report_path,
        download_count: report.download_count
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all evaluations with comprehensive details
exports.getAllEvaluationsDetailed = async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
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

    const scores = await Score.find();
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
        rejectionReason: evaluation.decision === "rejected" ? evaluation.remarks : null,
        numberOfScores: activityScores.length
      };
    });

    res.json({
      totalEvaluations: formattedResults.length,
      approvedCount: formattedResults.filter((e) => e.status === "Approved").length,
      rejectedCount: formattedResults.filter((e) => e.status === "Rejected").length,
      evaluations: formattedResults
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to get certification grade
const getCertificationGrade = (score) => {
  if (score >= 90) return "Platinum";
  if (score >= 80) return "Gold";
  if (score >= 70) return "Silver";
  if (score >= 60) return "Bronze";
  return "Standard";
};
