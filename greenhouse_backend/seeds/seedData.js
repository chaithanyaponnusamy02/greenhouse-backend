const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const GreenActivity = require("../models/GreenActivity");
const ActivityDocument = require("../models/ActivityDocument");
const Evaluation = require("../models/Evaluation");
const Score = require("../models/Score");
const StudentParticipation = require("../models/StudentParticipation");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");

// Sample data
const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@greenhouse.com",
    password: "admin123",
    role: "admin",
    department: "Administration",
    status: "active"
  },
  {
    name: "Dr. John Faculty",
    email: "john.faculty@greenhouse.com",
    password: "faculty123",
    role: "faculty",
    department: "Environmental Science",
    status: "active"
  },
  {
    name: "Dr. Sarah Faculty",
    email: "sarah.faculty@greenhouse.com",
    password: "faculty123",
    role: "faculty",
    department: "Biology",
    status: "active"
  },
  {
    name: "Auditor Mike",
    email: "mike.auditor@greenhouse.com",
    password: "auditor123",
    role: "auditor",
    department: "Quality Assurance",
    status: "active"
  },
  {
    name: "Auditor Lisa",
    email: "lisa.auditor@greenhouse.com",
    password: "auditor123",
    role: "auditor",
    department: "Quality Assurance",
    status: "active"
  },
  {
    name: "Student Alex",
    email: "alex.student@greenhouse.com",
    password: "student123",
    role: "student",
    department: "Environmental Engineering",
    status: "active"
  },
  {
    name: "Student Emma",
    email: "emma.student@greenhouse.com",
    password: "student123",
    role: "student",
    department: "Environmental Engineering",
    status: "active"
  },
  {
    name: "Student David",
    email: "david.student@greenhouse.com",
    password: "student123",
    role: "student",
    department: "Botany",
    status: "active"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await GreenActivity.deleteMany({});
    await ActivityDocument.deleteMany({});
    await Evaluation.deleteMany({});
    await Score.deleteMany({});
    await StudentParticipation.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Hash passwords and insert users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const users = await User.insertMany(hashedUsers);
    console.log(`✅ Inserted ${users.length} users`);

    // Get user IDs
    const admin = users.find(u => u.role === "admin");
    const faculty = users.filter(u => u.role === "faculty");
    const auditors = users.filter(u => u.role === "auditor");
    const students = users.filter(u => u.role === "student");

    // Create Activities
    const activities = await GreenActivity.insertMany([
      {
        title: "Tree Plantation Drive",
        category: "Afforestation",
        description: "Plant 500 trees in the campus premises",
        activity_date: new Date("2024-05-15"),
        faculty_id: faculty[0]._id,
        status: "approved",
        created_at: new Date("2024-04-20")
      },
      {
        title: "Water Conservation Workshop",
        category: "Workshop",
        description: "Educational workshop on water conservation techniques",
        activity_date: new Date("2024-06-10"),
        faculty_id: faculty[1]._id,
        status: "approved",
        created_at: new Date("2024-04-22")
      },
      {
        title: "Waste Management Initiative",
        category: "Waste Management",
        description: "Implement waste segregation and recycling system",
        activity_date: new Date("2024-07-01"),
        faculty_id: faculty[0]._id,
        status: "pending",
        created_at: new Date("2024-05-01")
      },
      {
        title: "Clean Energy Seminar",
        category: "Energy",
        description: "Seminar on renewable energy sources",
        activity_date: new Date("2024-08-15"),
        faculty_id: faculty[1]._id,
        status: "rejected",
        created_at: new Date("2024-05-05")
      },
      {
        title: "Plastic-Free Campus",
        category: "Plastic Reduction",
        description: "Eliminate single-use plastics from campus",
        activity_date: new Date("2024-09-20"),
        faculty_id: faculty[0]._id,
        status: "approved",
        created_at: new Date("2024-05-10")
      },
       {
        title: "Plastic-Free Campus new",
        category: "Plastic Reduction new",
        description: "Eliminate single-use plastics from campus",
        activity_date: new Date("2026-05-20"),
        faculty_id: faculty[0]._id,
        status: "approved",
        created_at: new Date("2026-05-10")
      }
    ]);
    console.log(`✅ Inserted ${activities.length} activities`);

    // Create Activity Documents
    const documents = await ActivityDocument.insertMany([
      {
        activity_id: activities[0]._id,
        file_path: "/uploads/tree-plantation-photos.pdf",
        uploaded_at: new Date("2024-05-16")
      },
      {
        activity_id: activities[0]._id,
        file_path: "/uploads/tree-plantation-report.docx",
        uploaded_at: new Date("2024-05-17")
      },
      {
        activity_id: activities[1]._id,
        file_path: "/uploads/water-workshop-slides.pptx",
        uploaded_at: new Date("2024-06-11")
      },
      {
        activity_id: activities[2]._id,
        file_path: "/uploads/waste-plan.pdf",
        uploaded_at: new Date("2024-05-02")
      }
    ]);
    console.log(`✅ Inserted ${documents.length} activity documents`);

    // Create Student Participation
    const participations = await StudentParticipation.insertMany([
      {
        student_id: students[0]._id,
        activity_id: activities[0]._id,
        participation_date: new Date("2024-05-15")
      },
      {
        student_id: students[1]._id,
        activity_id: activities[0]._id,
        participation_date: new Date("2024-05-15")
      },
      {
        student_id: students[2]._id,
        activity_id: activities[0]._id,
        participation_date: new Date("2024-05-15")
      },
      {
        student_id: students[0]._id,
        activity_id: activities[1]._id,
        participation_date: new Date("2024-06-10")
      },
      {
        student_id: students[1]._id,
        activity_id: activities[4]._id,
        participation_date: new Date("2024-09-20")
      }
    ]);
    console.log(`✅ Inserted ${participations.length} student participations`);

    // Create Evaluations
    const evaluations = await Evaluation.insertMany([
      {
        activity_id: activities[0]._id,
        auditor_id: auditors[0]._id,
        decision: "approved",
        remarks: "Excellent execution, great community participation",
        score: 95,
        evaluated_at: new Date("2024-05-20")
      },
      {
        activity_id: activities[1]._id,
        auditor_id: auditors[1]._id,
        decision: "approved",
        remarks: "Well-organized and informative",
        score: 88,
        evaluated_at: new Date("2024-06-15")
      },
      {
        activity_id: activities[2]._id,
        auditor_id: auditors[0]._id,
        decision: "rejected",
        remarks: "Lacks proper documentation and planning",
        score: 45,
        evaluated_at: new Date("2024-05-10")
      },
      {
        activity_id: activities[4]._id,
        auditor_id: auditors[1]._id,
        decision: "approved",
        remarks: "Outstanding initiative, good impact",
        score: 92,
        evaluated_at: new Date("2024-09-25")
      }
    ]);
    console.log(`✅ Inserted ${evaluations.length} evaluations`);

    // Create Scores
    const scores = await Score.insertMany([
      {
        activity_id: activities[0]._id,
        auditor_id: auditors[0]._id,
        score: 95,
        criteria: "Community Impact",
        scored_at: new Date("2024-05-20")
      },
      {
        activity_id: activities[0]._id,
        auditor_id: auditors[0]._id,
        score: 90,
        criteria: "Sustainability",
        scored_at: new Date("2024-05-20")
      },
      {
        activity_id: activities[1]._id,
        auditor_id: auditors[1]._id,
        score: 88,
        criteria: "Educational Value",
        scored_at: new Date("2024-06-15")
      },
      {
        activity_id: activities[4]._id,
        auditor_id: auditors[1]._id,
        score: 92,
        criteria: "Environmental Impact",
        scored_at: new Date("2024-09-25")
      },
      {
        activity_id: activities[4]._id,
        auditor_id: auditors[1]._id,
        score: 91,
        criteria: "Implementation Quality",
        scored_at: new Date("2024-09-25")
      }
    ]);
    console.log(`✅ Inserted ${scores.length} scores`);

    // Create Notifications
    const notifications = await Notification.insertMany([
      {
        user_id: faculty[0]._id,
        message: "Your activity 'Tree Plantation Drive' has been approved",
        is_read: true,
        created_at: new Date("2024-05-20")
      },
      {
        user_id: faculty[1]._id,
        message: "New evaluation for 'Water Conservation Workshop' is available",
        is_read: false,
        created_at: new Date("2024-06-15")
      },
      {
        user_id: students[0]._id,
        message: "Thank you for participating in 'Tree Plantation Drive'",
        is_read: true,
        created_at: new Date("2024-05-16")
      },
      {
        user_id: students[1]._id,
        message: "New activity available: 'Plastic-Free Campus'",
        is_read: false,
        created_at: new Date("2024-09-20")
      },
      {
        user_id: auditors[0]._id,
        message: "Activity evaluation request: Review 'Tree Plantation Drive'",
        is_read: true,
        created_at: new Date("2024-05-18")
      }
    ]);
    console.log(`✅ Inserted ${notifications.length} notifications`);

    // Create Reports
    const reports = await Report.insertMany([
      {
        generated_by: admin._id,
        report_title: "Green Score Certification - May 2024",
        report_type: "Monthly",
        start_date: new Date("2024-05-01"),
        end_date: new Date("2024-05-31"),
        total_score: 280,
        activities_count: 3,
        certification_grade: "Gold",
        report_path: "/reports/green-score-2024-05.pdf",
        status: "Generated",
        download_count: 0,
        generated_at: new Date("2024-06-01")
      },
      {
        generated_by: admin._id,
        report_title: "Green Score Certification - June 2024",
        report_type: "Monthly",
        start_date: new Date("2024-06-01"),
        end_date: new Date("2024-06-30"),
        total_score: 88,
        activities_count: 1,
        certification_grade: "Gold",
        report_path: "/reports/green-score-2024-06.pdf",
        status: "Generated",
        download_count: 1,
        generated_at: new Date("2024-07-01")
      },
      {
        generated_by: admin._id,
        report_title: "Green Score Certification - Annual 2024",
        report_type: "Annual",
        start_date: new Date("2024-01-01"),
        end_date: new Date("2024-12-31"),
        total_score: 546,
        activities_count: 5,
        certification_grade: "Platinum",
        report_path: "/reports/green-score-2024-annual.pdf",
        status: "Generated",
        download_count: 2,
        generated_at: new Date("2024-12-31")
      }
    ]);
    console.log(`✅ Inserted ${reports.length} reports`);

    console.log("\n✅ ✅ ✅ DATABASE SEEDING COMPLETED SUCCESSFULLY! ✅ ✅ ✅\n");
    console.log("Summary:");
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Activities: ${activities.length}`);
    console.log(`  - Documents: ${documents.length}`);
    console.log(`  - Evaluations: ${evaluations.length}`);
    console.log(`  - Scores: ${scores.length}`);
    console.log(`  - Participations: ${participations.length}`);
    console.log(`  - Notifications: ${notifications.length}`);
    console.log(`  - Reports: ${reports.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
