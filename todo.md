# Backend TODO - Mini Learning Management System

Ye file backend ka detailed roadmap hai: konsi file banani hai, konsi existing file update karni hai, aur kis order mein kaam karna hai.

## 1. Sabse Pehle Backend Setup Fixes

### Update karni wali files

- `backend/src/app.js`
  - `express.json()` middleware add karo.
  - `cors` middleware add karo.
  - MongoDB connection import/use karo.
  - `/api/auth`, `/api/courses`, `/api/enrollments`, `/api/progress`, `/api/quizzes`, `/api/certificates`, `/api/analytics`, `/api/discussions` routes mount karo.
  - Global `notFound` aur `errorHandler` middleware add karo.

- `backend/src/controllers/authController.js`
  - CommonJS `require/module.exports` ko ES module `import/export` mein convert karo, kyunki `backend/package.json` mein `"type": "module"` hai.
  - `bcrypt` package code mein use ho raha hai, lekin package installed `bcryptjs` hai. Import `bcryptjs` se karo.
  - Token payload mein `role` bhi include karo.
  - Response user object mein `_id`, `name`, `email`, `role` bhejo.

- `backend/src/routes/authRoutes.js`
  - CommonJS ko ES module mein convert karo.
  - Login route bug fix karo: `router.post("/login", asyncHandler(login));`
  - Current user route add karo: `router.get("/me", protect, getMe);`

- `backend/package.json`
  - Test script meaningful banao.
  - Example:
    - `"test": "node --test"`
    - Ya agar Jest/Supertest use karna hai to dependencies add karke script update karo.

## 2. Config Files Banani Hain

### Create: `backend/src/config/db.js`

Kaam:

- `mongoose` connect function banao.
- `process.env.MONGO_URI` read karo.
- Connection success/failure log karo.
- App start hone se pehle DB connect ho.

Expected export:

- `connectDB`

### Create: `backend/src/config/env.js`

Kaam:

- Required env variables validate karo.
- `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` export karo.
- Missing env par clear error throw karo.

## 3. Middleware Files Banani Hain

### Create: `backend/src/middleware/authMiddleware.js`

Kaam:

- Bearer token read karo.
- JWT verify karo.
- User DB se fetch karo.
- `req.user` set karo.
- Invalid/missing token par `401` return karo.

Exports:

- `protect`
- `authorizeRoles(...roles)`

### Create: `backend/src/middleware/errorMiddleware.js`

Kaam:

- `notFound` middleware.
- `errorHandler` middleware.
- Duplicate Mongo key, validation error, cast error ke readable messages.

Exports:

- `notFound`
- `errorHandler`

### Update: `backend/src/middleware/asyncHandler.js`

Kaam:

- ES module export use karo.
- Async route errors ko `next(error)` mein pass karo.

## 4. Models Complete Karne Hain

Existing models:

- `backend/src/models/User.js`
- `backend/src/models/Course.js`
- `backend/src/models/Module.js`
- `backend/src/models/Lesson.js`
- `backend/src/models/Enrollment.js`
- `backend/src/models/LessonProgress.js`
- `backend/src/models/Quiz.js`
- `backend/src/models/Question.js`
- `backend/src/models/QuizAttempt.js`

### Create: `backend/src/models/Certificate.js`

Fields:

- `learner` - User ref, required
- `course` - Course ref, required
- `certificateId` - unique public id, required
- `issuedAt` - Date
- `status` - `active`, `revoked`
- `scoreSummary` - quiz/progress summary object

Indexes:

- Unique index on `certificateId`
- Compound unique index on `learner + course`

### Create: `backend/src/models/Discussion.js`

Fields:

- `course` - Course ref
- `lesson` - Lesson ref
- `author` - User ref
- `body` - String
- `parent` - Discussion ref for replies
- `isPinned` - Boolean
- `isInstructorAnswer` - Boolean

Use case:

- Lesson ke neeche discussion thread aur replies.

### Existing Models Review

Har model mein check karo:

- Required fields sahi hain ya nahi.
- References correct hain ya nahi.
- Indexes added hain ya nahi.
- `timestamps: true` hai ya nahi.
- Soft delete/publish flags ki zarurat hai ya nahi.

## 5. Auth Feature Complete Karna Hai

### Update: `backend/src/controllers/authController.js`

Functions:

- `register`
- `login`
- `getMe`
- `logout` optional, agar token client-side remove karna hai to backend route zaruri nahi.

Validation:

- Name required.
- Email valid format.
- Password minimum 6 ya 8 characters.
- Role sirf allowed values mein ho.
- Public registration mein role default `learner` rakho.

### Update: `backend/src/routes/authRoutes.js`

Routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## 6. Course Management Banani Hai

### Create: `backend/src/controllers/courseController.js`

Functions:

- `getCourses` - public catalog
- `getCourseById` - course detail with modules/lessons
- `createCourse` - instructor/admin only
- `updateCourse` - owner instructor/admin only
- `deleteCourse` - owner instructor/admin only
- `publishCourse` - instructor/admin only

### Create: `backend/src/routes/courseRoutes.js`

Routes:

- `GET /api/courses`
- `GET /api/courses/:courseId`
- `POST /api/courses`
- `PATCH /api/courses/:courseId`
- `DELETE /api/courses/:courseId`
- `PATCH /api/courses/:courseId/publish`

### Create: `backend/src/services/courseService.js`

Kaam:

- Course ownership check.
- Course detail aggregation.
- Published catalog filtering.

## 7. Module And Lesson Management Banani Hai

### Create: `backend/src/controllers/moduleController.js`

Functions:

- `createModule`
- `updateModule`
- `deleteModule`
- `reorderModules`

### Create: `backend/src/routes/moduleRoutes.js`

Routes:

- `POST /api/courses/:courseId/modules`
- `PATCH /api/modules/:moduleId`
- `DELETE /api/modules/:moduleId`
- `PATCH /api/courses/:courseId/modules/reorder`

### Create: `backend/src/controllers/lessonController.js`

Functions:

- `createLesson`
- `updateLesson`
- `deleteLesson`
- `reorderLessons`

### Create: `backend/src/routes/lessonRoutes.js`

Routes:

- `POST /api/modules/:moduleId/lessons`
- `PATCH /api/lessons/:lessonId`
- `DELETE /api/lessons/:lessonId`
- `PATCH /api/modules/:moduleId/lessons/reorder`

## 8. Enrollment Feature Banani Hai

### Create: `backend/src/controllers/enrollmentController.js`

Functions:

- `enrollInCourse`
- `unenrollFromCourse`
- `getMyEnrollments`
- `getEnrollmentSummary`

### Create: `backend/src/routes/enrollmentRoutes.js`

Routes:

- `POST /api/enrollments/:courseId`
- `DELETE /api/enrollments/:courseId`
- `GET /api/enrollments/me`
- `GET /api/enrollments/:courseId/summary`

### Create: `backend/src/services/enrollmentService.js`

Kaam:

- Duplicate enrollment prevent karo.
- Sirf published course mein enroll allow karo.
- Started course ko unenroll karne ka rule decide karo.

## 9. Video Progress Tracking Banani Hai

### Create: `backend/src/controllers/progressController.js`

Functions:

- `saveLessonProgress`
- `getLessonProgress`
- `markLessonComplete`
- `getCourseProgress`

### Create: `backend/src/routes/progressRoutes.js`

Routes:

- `PATCH /api/progress/lessons/:lessonId`
- `GET /api/progress/lessons/:lessonId`
- `POST /api/progress/lessons/:lessonId/complete`
- `GET /api/progress/courses/:courseId`

### Create: `backend/src/services/progressService.js`

Kaam:

- Watched seconds save karo.
- Lesson duration ke 90 percent par completed mark karo.
- Course completion percentage calculate karo.
- Next module unlock logic prepare karo.

## 10. Quiz Feature Banani Hai

### Create: `backend/src/controllers/quizController.js`

Functions:

- `getQuizForLearner`
- `createQuiz`
- `updateQuiz`
- `addQuestion`
- `submitQuizAttempt`
- `getMyQuizAttempts`

### Create: `backend/src/routes/quizRoutes.js`

Routes:

- `GET /api/quizzes/:quizId`
- `POST /api/modules/:moduleId/quizzes`
- `PATCH /api/quizzes/:quizId`
- `POST /api/quizzes/:quizId/questions`
- `POST /api/quizzes/:quizId/attempts`
- `GET /api/quizzes/:quizId/attempts/me`

### Create: `backend/src/services/quizService.js`

Kaam:

- Learner ko correct answer expose mat karo.
- Submit answers grade karo.
- Score percentage calculate karo.
- Pass/fail decide karo.
- Max attempts rule apply karo.

## 11. Certificate Feature Banani Hai

### Create: `backend/src/controllers/certificateController.js`

Functions:

- `issueCertificate`
- `getMyCertificate`
- `verifyCertificate`
- `downloadCertificate`

### Create: `backend/src/routes/certificateRoutes.js`

Routes:

- `POST /api/certificates/courses/:courseId/issue`
- `GET /api/certificates/:certificateId`
- `GET /api/certificates/verify/:certificateId`
- `GET /api/certificates/:certificateId/download`

### Create: `backend/src/services/certificateService.js`

Kaam:

- Course complete hai ya nahi check karo.
- Quiz pass hai ya nahi check karo.
- Duplicate certificate avoid karo.
- Public verification payload return karo.

## 12. Analytics Feature Banani Hai

### Create: `backend/src/controllers/analyticsController.js`

Functions:

- `getInstructorAnalytics`
- `getCourseAnalytics`
- `getAdminAnalytics`

### Create: `backend/src/routes/analyticsRoutes.js`

Routes:

- `GET /api/analytics/instructor`
- `GET /api/analytics/courses/:courseId`
- `GET /api/analytics/admin`

### Create: `backend/src/services/analyticsService.js`

Metrics:

- Total enrollments
- Completion rate
- Average quiz score
- Lesson drop-off
- Active learners
- Published/unpublished course counts

## 13. Discussion Feature Banani Hai

### Create: `backend/src/controllers/discussionController.js`

Functions:

- `getLessonThread`
- `createDiscussionPost`
- `replyToPost`
- `pinInstructorAnswer`
- `deleteDiscussionPost`

### Create: `backend/src/routes/discussionRoutes.js`

Routes:

- `GET /api/discussions/lessons/:lessonId`
- `POST /api/discussions/lessons/:lessonId`
- `POST /api/discussions/:postId/replies`
- `PATCH /api/discussions/:postId/pin`
- `DELETE /api/discussions/:postId`

## 14. Validators Banane Hain

### Create files

- `backend/src/validators/authValidator.js`
- `backend/src/validators/courseValidator.js`
- `backend/src/validators/quizValidator.js`
- `backend/src/validators/progressValidator.js`

Kaam:

- Request body validate karo.
- Required fields missing par `400` error.
- IDs valid Mongo ObjectId hain ya nahi check karo.
- Numeric limits validate karo.

Simple start:

- Manual validation functions banao.

Better option:

- `zod` ya `joi` add karke schema validation use karo.

## 15. Utils Banane Hain

### Create: `backend/src/utils/generateToken.js`

Kaam:

- JWT sign logic centralize karo.

### Create: `backend/src/utils/apiError.js`

Kaam:

- Custom error class banao with `statusCode`.

### Create: `backend/src/utils/generateCertificateId.js`

Kaam:

- Unique certificate id generate karo.
- Example format: `MLS-2026-XXXXXX`

### Create: `backend/src/utils/ownership.js`

Kaam:

- Instructor course owner hai ya nahi check karne ke helper functions.

## 16. Seed Data Banani Hai

### Create: `backend/src/seed/seed.js`

Seed users:

- Admin user
- Instructor user
- Learner user

Seed course data:

- 2 published courses
- 1 draft course
- Modules
- Lessons
- Quiz
- Questions

### Update: `backend/package.json`

Script add karo:

- `"seed": "node src/seed/seed.js"`

## 17. Tests Banane Hain

### Create/update test files

- `backend/tests/auth/auth.test.js`
- `backend/tests/courses/course.test.js`
- `backend/tests/progress/progress.test.js`
- `backend/tests/quiz/quiz.test.js`
- `backend/tests/certificates/certificate.test.js`

Test coverage:

- Register/login success.
- Duplicate email reject.
- Protected route without token reject.
- Role authorization works.
- Course create only instructor/admin.
- Learner can enroll in published course.
- Progress reaches completion at 90 percent watched.
- Quiz grading correct.
- Certificate issue only after completion.

## 18. API Documentation Update Karni Hai

### Update: `docs/api/endpoints.md`

Har endpoint ke liye likho:

- Method
- URL
- Auth required hai ya nahi
- Role required hai ya nahi
- Request body
- Success response
- Error response
- Curl example

## 19. Recommended Work Order

1. ES module/CommonJS mismatch fix karo.
2. DB config aur app middleware setup karo.
3. Error middleware aur auth middleware banao.
4. Auth routes complete karo.
5. Course, module, lesson CRUD banao.
6. Enrollment banao.
7. Progress tracking banao.
8. Quiz grading banao.
9. Certificate issue/verify banao.
10. Analytics banao.
11. Discussion banao.
12. Seed data banao.
13. Tests add karo.
14. API docs update karo.

## 20. Run Commands

Backend install:

```bash
cd backend
npm install
```

Backend dev server:

```bash
cd backend
npm run dev
```

Seed data:

```bash
cd backend
npm run seed
```

Tests:

```bash
cd backend
npm test
```

## 21. Important Bugs/Notes

- `backend/src/routes/authRoutes.js` mein login route currently `register` call kar raha hai. Isko `login` karna hai.
- `backend/package.json` mein `"type": "module"` hai, isliye backend files mein `import/export` use karo.
- `authController.js` mein `bcrypt` import hai, lekin dependency `bcryptjs` installed hai.
- `backend/src/app.js` abhi sirf server start karta hai. Isme DB, middleware, routes, aur error handling add karni hai.
- `.env` file mein required values set karo:
  - `PORT`
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLIENT_URL`
