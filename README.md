# Mini Learning Management System (LMS)

A lightweight MERN stack LMS with video progress tracking, module locking, and role-based access control.

## 🚀 Features

### Core Features
- **Three Roles**: Admin, Instructor, and Learner with distinct dashboards.
- **Course Builder**: Instructors can create courses, ordered modules, and lessons.
- **Video Progress Tracking**: Resumes exactly where the learner left off.
- **Completion Logic**: Lessons are marked complete at ≥ 90% watch time.
- **Sequential Unlocking**: Modules are locked until the previous module's quiz is passed.
- **Quizzes**: MCQ-based end-of-module quizzes with auto-grading.
- **Progress Bars**: Visual tracking of course and lesson completion.

### Advanced Features
- **Aggregated Queries**: Optimized MongoDB pipelines for course details and progress.
- **Debounced Saves**: Progress is saved every 10 seconds to optimize API performance.
- **Instructor Analytics**: Visual trends for enrollments and performance.

## 🛠 Tech Stack
- **Frontend**: React.js, React Router, React Query, CSS3.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Auth**: JWT (JSON Web Tokens).

## 📦 Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or Atlas)

### Step 1: Clone and Install
```bash
git clone <repo-url>
cd Mini-Learning-Management-System
```

### Step 2: Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/mini-lms
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Cloudinary is used for course thumbnails, promo videos, and lesson videos when the `CLOUDINARY_*` variables are set. If they are missing, uploads fall back to local `/uploads` storage for development.

### Step 3: Seed Database
Populate the database with demo users and a sample course:
```bash
cd backend
node seed.js
```

### Step 4: Run the Application
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Demo Accounts
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | admin@lms.com | password123 |
| **Instructor** | instructor@lms.com | password123 |
| **Learner** | learner@lms.com | password123 |

## 🧪 API Testing

Replace `TOKEN` and ids with values returned by your local server.

```bash
# Register / login
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Demo Learner\",\"email\":\"demo@lms.com\",\"password\":\"password123\",\"role\":\"learner\"}"
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"learner@lms.com\",\"password\":\"password123\"}"

# Catalog and course detail with modules + progress
curl http://localhost:3000/api/courses
curl http://localhost:3000/api/courses/COURSE_ID -H "Authorization: Bearer TOKEN"

# Enrollment lifecycle
curl -X POST http://localhost:3000/api/enrollments/COURSE_ID -H "Authorization: Bearer TOKEN"
curl http://localhost:3000/api/enrollments/me -H "Authorization: Bearer TOKEN"
curl -X DELETE http://localhost:3000/api/enrollments/COURSE_ID -H "Authorization: Bearer TOKEN"

# Video progress, resume, quiz, certificate
curl -X POST http://localhost:3000/api/progress -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"lesson\":\"LESSON_ID\",\"watchedSeconds\":270,\"lastPositionSeconds\":270,\"totalDuration\":300}"
curl http://localhost:3000/api/progress/course/COURSE_ID/lesson/LESSON_ID -H "Authorization: Bearer TOKEN"
curl http://localhost:3000/api/quizzes/module/MODULE_ID -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:3000/api/quizzes/QUIZ_ID/submit -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"answers\":{\"QUESTION_ID\":\"OPTION_ID\"}}"
curl -X POST http://localhost:3000/api/certificates/COURSE_ID -H "Authorization: Bearer TOKEN"
curl http://localhost:3000/verify/CERT_ID
```

Protected learner routes return `401` without a token and `403` when the wrong role attempts learner-only actions. Instructor/admin endpoints are guarded by role middleware.

## 📄 License
MIT
