# Test Data Documentation

## Overview
Complete sample data for all MongoDB collections in the Greenhouse Backend project.

## How to Seed Data

```bash
npm run seed
```

This will:
1. Clear all existing collections
2. Create sample users, activities, evaluations, scores, and reports
3. Display a summary of inserted data

---

## Sample Data Breakdown

### 👥 Users (8 total)

#### Admin
- **Email**: admin@greenhouse.com
- **Password**: admin123
- **Role**: admin
- **Department**: Administration

#### Faculty (2 users)
1. **Dr. John Faculty**
   - Email: john.faculty@greenhouse.com
   - Password: faculty123
   - Department: Environmental Science

2. **Dr. Sarah Faculty**
   - Email: sarah.faculty@greenhouse.com
   - Password: faculty123
   - Department: Biology

#### Auditors (2 users)
1. **Auditor Mike**
   - Email: mike.auditor@greenhouse.com
   - Password: auditor123
   - Department: Quality Assurance

2. **Auditor Lisa**
   - Email: lisa.auditor@greenhouse.com
   - Password: auditor123
   - Department: Quality Assurance

#### Students (3 users)
1. **Student Alex**
   - Email: alex.student@greenhouse.com
   - Password: student123
   - Department: Environmental Engineering

2. **Student Emma**
   - Email: emma.student@greenhouse.com
   - Password: student123
   - Department: Environmental Engineering

3. **Student David**
   - Email: david.student@greenhouse.com
   - Password: student123
   - Department: Botany

---

### 🌱 Activities (5 total)

| Activity | Faculty | Status | Category | Date |
|----------|---------|--------|----------|------|
| Tree Plantation Drive | Dr. John | Approved | Afforestation | 2024-05-15 |
| Water Conservation Workshop | Dr. Sarah | Approved | Workshop | 2024-06-10 |
| Waste Management Initiative | Dr. John | Pending | Waste Management | 2024-07-01 |
| Clean Energy Seminar | Dr. Sarah | Rejected | Energy | 2024-08-15 |
| Plastic-Free Campus | Dr. John | Approved | Plastic Reduction | 2024-09-20 |

---

### 📄 Activity Documents (4 total)

- Tree Plantation: 2 documents (photos, report)
- Water Workshop: 1 document (slides)
- Waste Management: 1 document (plan)

---

### ✅ Evaluations (4 total)

| Activity | Auditor | Decision | Score | Remarks |
|----------|---------|----------|-------|---------|
| Tree Plantation Drive | Auditor Mike | Approved | 95 | Excellent execution |
| Water Conservation Workshop | Auditor Lisa | Approved | 88 | Well-organized |
| Waste Management Initiative | Auditor Mike | Rejected | 45 | Lacks documentation |
| Plastic-Free Campus | Auditor Lisa | Approved | 92 | Outstanding initiative |

---

### 🏆 Scores (5 total)

By Criteria:
- **Tree Plantation**: Community Impact (95), Sustainability (90)
- **Water Workshop**: Educational Value (88)
- **Plastic-Free Campus**: Environmental Impact (92), Implementation Quality (91)

---

### 👥 Student Participation (5 records)

- **Tree Plantation Drive**: Alex, Emma, David
- **Water Conservation Workshop**: Alex
- **Plastic-Free Campus**: Emma

---

### 🔔 Notifications (5 total)

| User | Message | Read |
|------|---------|------|
| Dr. John | Activity approved notification | ✅ |
| Dr. Sarah | New evaluation available | ❌ |
| Student Alex | Thank you for participating | ✅ |
| Student Emma | New activity available | ❌ |
| Auditor Mike | Evaluation request | ✅ |

---

### 📊 Reports (3 total)

1. **Monthly Report - May 2024**
   - Grade: Gold
   - Total Score: 280
   - Activities: 3

2. **Monthly Report - June 2024**
   - Grade: Gold
   - Total Score: 88
   - Activities: 1
   - Downloads: 1

3. **Annual Report - 2024**
   - Grade: Platinum
   - Total Score: 546
   - Activities: 5
   - Downloads: 2

---

## Grades Reference

| Score Range | Grade |
|-------------|-------|
| 90+ | Platinum |
| 80-89 | Gold |
| 70-79 | Silver |
| 60-69 | Bronze |
| <60 | Standard |

---

## Testing Scenarios

### Scenario 1: Admin Login & Dashboard
```
Email: admin@greenhouse.com
Password: admin123
```
Expected: View all users, activities, and generate reports

### Scenario 2: Faculty Login & Submit Activity
```
Email: john.faculty@greenhouse.com
Password: faculty123
```
Expected: View own activities, upload documents, track evaluations

### Scenario 3: Auditor Review Activities
```
Email: mike.auditor@greenhouse.com
Password: auditor123
```
Expected: Review pending activities, assign scores, approve/reject

### Scenario 4: Student Participation
```
Email: alex.student@greenhouse.com
Password: student123
```
Expected: View approved activities, mark participation, check scores

---

## Database Relationships

```
User (Admin) ──┬─→ many Activities (Faculty)
               ├─→ many Evaluations (Auditor)
               ├─→ many Scores (Auditor)
               ├─→ many Notifications
               └─→ many Reports

Activity ──┬─→ many ActivityDocuments
           ├─→ one Evaluation
           ├─→ many Scores
           └─→ many StudentParticipations

StudentParticipation ──→ User (Student)
```

---

## Notes

- All passwords are hashed with bcrypt (salt rounds: 10)
- Timestamps are in Date format
- MongoDB ObjectIds are auto-generated
- Sample activities cover different approval statuses for testing workflows
- Documents point to sample file paths (actual files not included)

---

## Modifying Sample Data

Edit `/seeds/seedData.js` to:
- Change user credentials
- Add more activities
- Modify evaluation scores
- Add more student participations
- Update report data

Then run seed again: `npm run seed`
