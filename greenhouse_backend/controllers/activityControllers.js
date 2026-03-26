const GreenActivity = require("../models/GreenActivity");
const ActivityDocument = require("../models/ActivityDocument");
const fs = require("fs");

exports.createActivity = async (req, res) => {
  try {
    const { title, category, description, activity_date } = req.body;
    if (!title || !category || !description || !activity_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const activity = await GreenActivity.create({
      title,
      category,
      description,
      activity_date,
      faculty_id: req.user.id
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMyActivities = async (req, res) => {
  try {
    const activities = await GreenActivity.findAll({
      where: { faculty_id: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSingleActivity = async (req, res) => {
  try {
    const activity = await GreenActivity.findOne({
      where: { activity_id: req.params.id, faculty_id: req.user.id },
      include: [ActivityDocument]
    });

    if (!activity) return res.status(404).json({ message: "Activity not found" });

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await GreenActivity.findByPk(req.params.id);

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.status !== "pending") return res.status(400).json({ message: "Cannot edit approved/rejected activity" });
    if (activity.faculty_id !== req.user.id) return res.status(403).json({ message: "Not your activity" });

    await activity.update(req.body);
    res.status(200).json({ message: "Activity updated successfully", activity });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await GreenActivity.findByPk(req.params.id);

    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.status !== "pending") return res.status(400).json({ message: "Cannot delete approved/rejected activity" });
    if (activity.faculty_id !== req.user.id) return res.status(403).json({ message: "Not your activity" });

    await activity.destroy();
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const activity = await GreenActivity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (activity.faculty_id !== req.user.id) return res.status(403).json({ message: "Not your activity" });

    const document = await ActivityDocument.create({
      activity_id: req.params.id,
      file_path: req.file.path
    });

    res.status(201).json({ message: "Document uploaded", document });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getActivityDocuments = async (req, res) => {
  try {
    const documents = await ActivityDocument.findAll({ where: { activity_id: req.params.id } });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await ActivityDocument.findByPk(req.params.docId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    const activity = await GreenActivity.findByPk(document.activity_id);
    if (activity.faculty_id !== req.user.id) return res.status(403).json({ message: "Not your activity" });

    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    await document.destroy();
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const totalActivities = await GreenActivity.count({ where: { faculty_id: facultyId } });
    const pending = await GreenActivity.count({ where: { faculty_id: facultyId, status: "pending" } });
    const approved = await GreenActivity.count({ where: { faculty_id: facultyId, status: "approved" } });
    const rejected = await GreenActivity.count({ where: { faculty_id: facultyId, status: "rejected" } });

    res.status(200).json({ totalActivities, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
