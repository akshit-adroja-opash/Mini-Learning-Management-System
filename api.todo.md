# 🧪 API Testing Guide — Mini Learning Management System

> **Base URL:** `http://localhost:3000/api`
>
> **Tool:** Use [Postman](https://www.postman.com/), [Thunder Client (VS Code)](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client), or `curl`
>
> **Note:** Jab bhi `🔒` dikhe, toh us request mein **Authorization header** lagana zaroori hai:
> ```
> Authorization: Bearer <YOUR_TOKEN>
> ```

---

## 📋 Testing Flow (Order mein follow karo)

```
1. Register → 2. Login → 3. Create Course → 4. Enroll →
5. Save Progress → 6. Get Progress → 7. Submit Quiz →
8. Generate Certificate → 9. Verify Certificate →
10. Discussions → 11. Analytics
```

---

## 1️⃣ Auth APIs (`/api/auth`)

### ✅ Register a new User
- [ ] **POST** `/api/auth/register`
- **Body (JSON):**
```json
{
  "name": "Test Learner",
  "email": "learner@test.com",
  "password": "123456",
  "role": "learner"
}
```
- **Expected:** `201` — Returns `{ token, user }`
- **📌 Save the `token` — isko aage sab requests mein use karna hai!**

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjA5M2QwZDQ4ZTJhNjE5MmY3MzU2YiIsInJvbGUiOiJsZWFybmVyIiwiaWF0IjoxNzc3Mzc0MTYwLCJleHAiOjE3Nzc5Nzg5NjB9.dO0xAWL7j_1i93ooPoXnWpJ1F_itBMdmr2667ZRaqzQ

### ✅ Register an Instructor
- [ ] **POST** `/api/auth/register`
- **Body (JSON):**
```json
{
  "name": "Test Instructor",
  "email": "instructor@test.com",
  "password": "123456",
  "role": "instructor"
}

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjA5NDU4ZDQ4ZTJhNjE5MmY3MzU2YyIsInJvbGUiOiJpbnN0cnVjdG9yIiwiaWF0IjoxNzc3Mzc0Mjk2LCJleHAiOjE3Nzc5NzkwOTZ9.XGxCRAdrfJllrK60tLFtIRDdMGYMH6JO21LyzmfgIH0
```
- **Expected:** `201` — Returns `{ token, user }`
- **📌 Instructor token alag save karo!**

### ✅ Register an Admin
- [ ] **POST** `/api/auth/register`
- **Body (JSON):**
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

### ✅ Login
- [ ] **POST** `/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "learner@test.com",
  "password": "123456"
}
```
- **Expected:** `200` — Returns `{ token, user }`

### ✅ Login — Wrong Password (Error Test)
- [ ] **POST** `/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "learner@test.com",
  "password": "wrongpassword"
}
```
- **Expected:** `400` — `{ msg: "Invalid credentials" }`

### 🔒 Get Current User Profile
- [ ] **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Expected:** `200` — Returns `{ user: { _id, name, email, role } }`

---

## 2️⃣ Courses APIs (`/api/courses`)

### 🔒 Create a Course (Instructor/Admin only)
- [ ] **POST** `/api/courses`
- **Headers:** `Authorization: Bearer <INSTRUCTOR_TOKEN>`
- **Body (JSON):**
```json
{
  "title": "JavaScript Mastery",
  "slug": "javascript-mastery",
  "description": "Complete JS course from zero to hero",
  "category": "Programming",
  "level": "beginner",
  "status": "published",
  "estimatedDurationMinutes": 120
}
```
- **Expected:** `200` — Returns created course object
- **📌 Save the course `_id` — enrollment, certificates mein use hoga!**

### ✅ Get All Courses (Public)
- [ ] **GET** `/api/courses`
- **Expected:** `200` — Returns array of courses with populated instructor

### ✅ Get Single Course (Public)
- [ ] **GET** `/api/courses/:id`
- **Replace `:id` with actual course `_id`**
- **Expected:** `200` — Returns single course with populated instructor

### 🔒 Create Course — Learner (Error Test)
- [ ] **POST** `/api/courses`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Body:** Same as above
- **Expected:** `403` — Learner ko course create karne ki permission nahi hai

---

## 3️⃣ Enrollments APIs (`/api/enrollments`)

### 🔒 Enroll in a Course
- [ ] **POST** `/api/enrollments/:courseId`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Replace `:courseId` with actual course `_id`**
- **Expected:** `200` — Returns enrollment object

### 🔒 Enroll Again — Duplicate (Error Test)
- [ ] **POST** `/api/enrollments/:courseId`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Expected:** `400` — `{ msg: "Already enrolled" }`

### 🔒 Unenroll from a Course
- [ ] **DELETE** `/api/enrollments/:courseId`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Expected:** `200` — `{ msg: "Unenrolled" }`

---

## 4️⃣ Progress APIs (`/api/progress`)

> **⚠️ Pre-requisite:** Database mein ek `Lesson` document hona chahiye. Agar nahi hai toh MongoDB Compass/Mongosh se manually create karo:
>
> ```js
> db.lessons.insertOne({
>   course: ObjectId("<COURSE_ID>"),
>   module: ObjectId("<MODULE_ID>"),
>   title: "Intro to JS",
>   videoUrl: "https://example.com/video.mp4",
>   durationSeconds: 600,
>   order: 1,
>   isPublished: true
> })
> ```

### 🔒 Save Progress
- [ ] **POST** `/api/progress`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Body (JSON):**
```json
{
  "lessonId": "<LESSON_ID>",
  "watchedSeconds": 300,
  "duration": 600
}
```
- **Expected:** `200` — Returns progress object with `watchedPercent: 50`

### 🔒 Save Progress — 90% (Completion Test)
- [ ] **POST** `/api/progress`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Body (JSON):**
```json
{
  "lessonId": "<LESSON_ID>",
  "watchedSeconds": 550,
  "duration": 600
}
```
- **Expected:** `200` — `isCompleted: true`, `watchedPercent >= 90`

### 🔒 Get Progress (Resume Video)
- [ ] **GET** `/api/progress/:lessonId`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Expected:** `200` — Returns progress or `{ watchedSeconds: 0 }`

---

## 5️⃣ Quizzes APIs (`/api/quizzes`)

> **⚠️ Pre-requisite:** Database mein `Quiz` aur `Question` documents hone chahiye. Manually create karo:
>
> ```js
> // Step 1: Create Quiz
> db.quizzes.insertOne({
>   course: ObjectId("<COURSE_ID>"),
>   module: ObjectId("<MODULE_ID>"),
>   title: "JS Basics Quiz",
>   passThreshold: 70,
>   maxAttempts: 3,
>   isPublished: true
> })
>
> // Step 2: Create Question (note the quiz _id from above)
> db.questions.insertOne({
>   quiz: ObjectId("<QUIZ_ID>"),
>   prompt: "What is typeof null?",
>   type: "single",
>   options: [
>     { text: "object", isCorrect: true },
>     { text: "null", isCorrect: false },
>     { text: "undefined", isCorrect: false },
>     { text: "string", isCorrect: false }
>   ],
>   order: 1,
>   points: 1
> })
> ```

### 🔒 Submit Quiz
- [ ] **POST** `/api/quizzes/:quizId/submit`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Body (JSON):**
```json
{
  "answers": {
    "<QUESTION_ID>": "<CORRECT_OPTION_ID>"
  }
}
```
- **Expected:** `200` — Returns attempt with `score`, `passed`, `percentage`

### 🔒 Submit Quiz — Wrong Answer
- [ ] **POST** `/api/quizzes/:quizId/submit`
- **Body (JSON):**
```json
{
  "answers": {
    "<QUESTION_ID>": "<WRONG_OPTION_ID>"
  }
}
```
- **Expected:** `200` — `passed: false`, `score: 0`

---

## 6️⃣ Discussions APIs (`/api/discussions`)

> **⚠️ Pre-requisite:** Ek `Lesson` ka `_id` chahiye (jo Step 4 mein banaya tha)

### 🔒 Add a Comment
- [ ] **POST** `/api/discussions/:lessonId`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Body (JSON):**
```json
{
  "body": "Great lesson! Very helpful."
}
```
- **Expected:** `200` — Returns created comment

### 🔒 Add a Reply (Threaded Comment)
- [ ] **POST** `/api/discussions/:lessonId`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Body (JSON):**
```json
{
  "body": "Thanks, I agree!",
  "parent": "<PARENT_COMMENT_ID>"
}
```
- **Expected:** `200` — Returns reply with `parent` field set

### 🔒 Get All Comments for a Lesson
- [ ] **GET** `/api/discussions/:lessonId`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Expected:** `200` — Returns array of comments sorted by `createdAt`

---

## 7️⃣ Certificates APIs (`/api/certificates`)

### 🔒 Generate Certificate
- [ ] **POST** `/api/certificates/:courseId`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Expected:** `200` — Returns certificate with `certificateId` (UUID)
- **📌 Save the `certificateId`!**

### ✅ Verify Certificate (Public)
- [ ] **GET** `/api/certificates/verify/:certId`
- **Replace `:certId` with the `certificateId` from above**
- **Expected:** `200` — Returns populated certificate (learner + course details)

### ✅ Verify Invalid Certificate (Error Test)
- [ ] **GET** `/api/certificates/verify/fake-invalid-id`
- **Expected:** `404` — `{ msg: "Invalid certificate" }`

---

## 8️⃣ Analytics APIs (`/api/analytics`)

### 🔒 Get Analytics (Instructor/Admin only)
- [ ] **GET** `/api/analytics`
- **Headers:** `Authorization: Bearer <INSTRUCTOR_TOKEN>`
- **Expected:** `200` — Returns `{ enrollments: [...], quizStats: [...] }`

### 🔒 Get Analytics — Learner (Error Test)
- [ ] **GET** `/api/analytics`
- **Headers:** `Authorization: Bearer <LEARNER_TOKEN>`
- **Expected:** `403` — Learner ko analytics dekhne ki permission nahi

---

## ⚡ Quick cURL Commands

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"123456","role":"learner"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### Get Courses (Public)
```bash
curl http://localhost:3000/api/courses
```

### Protected Request Example
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## ✅ Testing Checklist Summary

| # | API | Method | Endpoint | Auth | Status |
|---|-----|--------|----------|------|--------|
| 1 | Register Learner | POST | `/api/auth/register` | ❌ | ⬜ |
| 2 | Register Instructor | POST | `/api/auth/register` | ❌ | ⬜ |
| 3 | Register Admin | POST | `/api/auth/register` | ❌ | ⬜ |
| 4 | Login | POST | `/api/auth/login` | ❌ | ⬜ |
| 5 | Login (wrong pass) | POST | `/api/auth/login` | ❌ | ⬜ |
| 6 | Get Me | GET | `/api/auth/me` | 🔒 | ⬜ |
| 7 | Create Course | POST | `/api/courses` | 🔒 Instructor | ⬜ |
| 8 | Get All Courses | GET | `/api/courses` | ❌ | ⬜ |
| 9 | Get Single Course | GET | `/api/courses/:id` | ❌ | ⬜ |
| 10 | Create Course (Learner) | POST | `/api/courses` | 🔒 Learner | ⬜ |
| 11 | Enroll | POST | `/api/enrollments/:courseId` | 🔒 | ⬜ |
| 12 | Enroll (duplicate) | POST | `/api/enrollments/:courseId` | 🔒 | ⬜ |
| 13 | Unenroll | DELETE | `/api/enrollments/:courseId` | 🔒 | ⬜ |
| 14 | Save Progress | POST | `/api/progress` | 🔒 | ⬜ |
| 15 | Save Progress (90%) | POST | `/api/progress` | 🔒 | ⬜ |
| 16 | Get Progress | GET | `/api/progress/:lessonId` | 🔒 | ⬜ |
| 17 | Submit Quiz | POST | `/api/quizzes/:quizId/submit` | 🔒 | ⬜ |
| 18 | Submit Quiz (wrong) | POST | `/api/quizzes/:quizId/submit` | 🔒 | ⬜ |
| 19 | Add Comment | POST | `/api/discussions/:lessonId` | 🔒 | ⬜ |
| 20 | Add Reply | POST | `/api/discussions/:lessonId` | 🔒 | ⬜ |
| 21 | Get Comments | GET | `/api/discussions/:lessonId` | 🔒 | ⬜ |
| 22 | Generate Certificate | POST | `/api/certificates/:courseId` | 🔒 | ⬜ |
| 23 | Verify Certificate | GET | `/api/certificates/verify/:certId` | ❌ | ⬜ |
| 24 | Verify (invalid) | GET | `/api/certificates/verify/fake` | ❌ | ⬜ |
| 25 | Get Analytics | GET | `/api/analytics` | 🔒 Instructor | ⬜ |
| 26 | Get Analytics (Learner) | GET | `/api/analytics` | 🔒 Learner | ⬜ |

---

> **Legend:** ❌ = No auth needed | 🔒 = Token required | ⬜ = Not tested yet
