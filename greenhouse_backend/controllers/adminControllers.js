const User = require("../models/User");
const GreenActivity = require("../models/GreenActivity");
const Score = require("../models/Score");
const Report = require("../models/Report");
const Evaluation = require("../models/Evaluation");
const StudentParticipation = require("../models/StudentParticipation");
const { Op } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword, role, department });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(req.body);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.status(200).json({ message: "User status updated", status: user.status });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.findAll();
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.filterActivities = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) return res.status(400).json({ message: "Status query parameter is required" });

    const activities = await GreenActivity.findAll({ where: { status } });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await GreenActivity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    await activity.destroy();
    res.status(200).json({ message: "Activity deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTotalScore = async (req, res) => {
  try {
    const total = await Score.sum("score");
    res.status(200).json({ total_score: total || 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getActivitySummary = async (req, res) => {
  try {
    const pending = await GreenActivity.count({ where: { status: "pending" } });
    const approved = await GreenActivity.count({ where: { status: "approved" } });
    const rejected = await GreenActivity.count({ where: { status: "rejected" } });

    res.status(200).json({ pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const report = await Report.create({
      generated_by: req.user.id,
      report_path: "reports/sample-report.pdf"
    });

    res.status(201).json({ message: "Report generated", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.findAll({
      include: [
        {
          model: User,
          as: 'auditor',
          attributes: ['name', 'department']
        },
        {
          model: GreenActivity,
          as: 'activity',
          attributes: ['title', 'category'],
          include: [{
            model: StudentParticipation,
            as: 'student_participations',
            include: [{
              model: User,
              as: 'student',
              attributes: ['name']
            }]
          }]
        }
      ]
    });

    const totalEvaluations = evaluations.length;

    const averageScore = evaluations.length > 0 ? (evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length).toFixed(1) : 0;

    const activeAuditors = new Set(evaluations.map(e => e.auditor_id)).size;

    // Compute auditor stats
    const auditorMap = {};
    evaluations.forEach(e => {
      const auditorId = e.auditor_id;
      if (!auditorMap[auditorId]) {
        auditorMap[auditorId] = {
          name: e.auditor ? e.auditor.name : 'Unknown',
          department: e.auditor ? e.auditor.department : 'Unknown',
          scores: [],
          count: 0
        };
      }
      auditorMap[auditorId].scores.push(e.score);
      auditorMap[auditorId].count++;
    });

    const auditorStats = Object.values(auditorMap).map(a => ({
      name: a.name,
      department: a.department,
      avgScore: (a.scores.reduce((sum, s) => sum + s, 0) / a.scores.length).toFixed(1),
      count: a.count
    }));

    // Format the evaluations
    const formattedEvaluations = evaluations.map(eval => ({
      auditor: eval.auditor ? eval.auditor.name : 'Unknown',
      activity: eval.activity ? eval.activity.title : 'Unknown',
      student: eval.activity && eval.activity.student_participations && eval.activity.student_participations.length > 0 ? eval.activity.student_participations[0].student.name : 'Unknown',
      category: eval.activity ? eval.activity.category : 'Unknown',
      score: eval.score,
      date: eval.evaluated_at,
      remarks: eval.remarks
    }));

    res.status(200).json({
      totalEvaluations,
      averageScore: `${averageScore}%`,
      activeAuditors,
      auditorStats,
      evaluations: formattedEvaluations
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to calculate certification grade based on score
const getCertificationGrade = (score) => {
  if (score >= 90) return 'Platinum';
  if (score >= 80) return 'Gold';
  if (score >= 70) return 'Silver';
  if (score >= 60) return 'Bronze';
  return 'Standard';
};

exports.generateReport = async (req, res) => {
  try {
    const { report_type, start_date, end_date } = req.body;

    if (!report_type || !start_date || !end_date) {
      return res.status(400).json({ message: "Report type, start date, and end date are required" });
    }

    // Get evaluations within date range
    const evaluations = await Evaluation.findAll({
      where: {
        evaluated_at: {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        }
      }
    });

    // Calculate metrics
    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const averageScore = evaluations.length > 0 ? Math.round((totalScore / evaluations.length)) : 0;
    const activitiesCount = await GreenActivity.count({
      where: {
        created_at: {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        }
      }
    });

    const certificationGrade = getCertificationGrade(averageScore);

    // Create report record
    const report = await Report.create({
      generated_by: req.user.id,
      report_title: `Green Score Certification - ${new Date(end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      report_type,
      start_date,
      end_date,
      total_score: totalScore,
      activities_count: activitiesCount,
      certification_grade: certificationGrade,
      report_path: `/reports/green-score-${Date.now()}.pdf`,
      status: 'Generated'
    });

    res.status(201).json({
      message: "Report generated successfully",
      report: {
        report_id: report.report_id,
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

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [{
        model: User,
        as: 'generatedBy',
        attributes: ['name']
      }],
      order: [['generated_at', 'DESC']]
    });

    const totalReportsGenerated = reports.length;
    const totalDownloads = reports.reduce((sum, r) => sum + r.download_count, 0);
    const lastReport = reports.length > 0 ? reports[0].generated_at : null;

    const formattedReports = reports.map(r => ({
      report_id: r.report_id,
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

exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.download_count += 1;
    report.status = 'Downloaded';
    await report.save();

    res.status(200).json({
      message: "Report downloaded successfully",
      report: {
        report_id: report.report_id,
        title: report.report_title,
        path: report.report_path,
        download_count: report.download_count
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Total Score (sum of all evaluation scores)
    const totalScoreResult = await Evaluation.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('score')), 'totalScore']
      ],
      raw: true
    });
    const totalScore = totalScoreResult[0].totalScore || 0;

    // Previous month total score for percentage calculation
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const previousScoreResult = await Evaluation.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('score')), 'totalScore']
      ],
      where: {
        evaluated_at: {
          [Op.lt]: lastMonth
        }
      },
      raw: true
    });
    const previousScore = previousScoreResult[0].totalScore || 1;
    const scorePercentageChange = ((totalScore - previousScore) / previousScore * 100).toFixed(1);

    // Total Activities
    const totalActivities = await GreenActivity.count();
    const previousActivities = await GreenActivity.count({
      where: {
        created_at: {
          [Op.lt]: lastMonth
        }
      }
    });
    const activitiesPercentageChange = previousActivities > 0 ? ((totalActivities - previousActivities) / previousActivities * 100).toFixed(1) : 0;

    // Total Users
    const totalUsers = await User.count();
    // User creation timestamps are not tracked in this schema, so use a safe fallback
    const previousUsers = totalUsers;
    const usersPercentageChange = 0;
    // Activity Status Distribution
    const approvedCount = await GreenActivity.count({ where: { status: 'approved' } });
    const pendingCount = await GreenActivity.count({ where: { status: 'pending' } });
    const rejectedCount = await GreenActivity.count({ where: { status: 'rejected' } });

    const approvedPercentageChange = totalActivities > 0 ? ((approvedCount - (approvedCount - rejectedCount - pendingCount)) / Math.max(approvedCount, 1) * 100).toFixed(1) : 0;

    // Score by Category
    const scoreByCategory = await GreenActivity.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('scores.score')), 'totalCategoryScore']
      ],
      include: [{
        model: Score,
        attributes: [],
        required: false
      }],
      group: ['category'],
      raw: true
    });

    // Recent Activities (last 5)
    const recentActivities = await GreenActivity.findAll({
      attributes: ['activity_id', 'title', 'category', 'status', 'activity_date'],
      include: [{
        model: User,
        attributes: ['name'],
        required: false
      }, {
        model: Score,
        attributes: ['score'],
        required: false
      }],
      order: [['activity_date', 'DESC']],
      limit: 5
    });

    // Format recent activities
    const formattedRecentActivities = recentActivities.map(activity => {
      const user = activity.User ? activity.User.name : 'Unknown';
      const score = activity.Scores && activity.Scores.length > 0 ? activity.Scores[0].score : 0;
      return {
        activity: activity.title,
        user: user,
        category: activity.category,
        score: score,
        status: activity.status
      };
    });

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
        },
        approvedActivitiesChange: approvedPercentageChange
      },
      scoreByCategory: scoreByCategory.map(cat => ({
        category: cat.category,
        score: cat.totalCategoryScore || 0
      })),
      recentActivities: formattedRecentActivities
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
