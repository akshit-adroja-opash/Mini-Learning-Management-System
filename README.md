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
```

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
A Postman collection is available in the `docs/` folder (or use the documented curl examples).

## 📄 License
MIT
