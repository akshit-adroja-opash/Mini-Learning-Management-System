# 🔍 Mini LMS — Full Code Audit Report

**Date:** 2026-05-13  
**Files Reviewed:** 40+ (all backend controllers, models, routes, middleware + all frontend pages, components, hooks, services)

---

## 🔴 Critical Bugs (Will cause crashes or data issues)

### 1. Duplicate `authorize` function — Two different files export the same function
- **Files:** `authMiddleware.js` (L44-51) AND `roleMiddleware.js` (L1-8)
- **Problem:** Both files export an identical `authorize` function. Some route files import from `authMiddleware.js`, others from `roleMiddleware.js`. This works now by coincidence, but is a maintenance hazard — updating one won't update the other.
- **Fix:** Remove the duplicate from `authMiddleware.js` OR `roleMiddleware.js` and use a single source.

### 2. Admin `deleteUser` uses wrong field names
- **File:** `adminController.js` (L57-60)
- **Problem:** Cleanup queries use `{ user: userId }` but the Enrollment, LessonProgress, QuizAttempt, and Certificate models use `{ learner: userId }` as the field name. This means **deleting a user leaves all their data behind**.
- **Code:**
  ```js
  await Enrollment.deleteMany({ user: userId });      // ❌ should be { learner: userId }
  await LessonProgress.deleteMany({ user: userId });   // ❌ should be { learner: userId }
  await QuizAttempt.deleteMany({ user: userId });      // ❌ should be { learner: userId }
  await Certificate.deleteMany({ user: userId });      // ❌ should be { user: userId } — need to check Certificate model
  ```

### 3. `deleteCourse` in `coursesController.js` does NOT delete quizzes, questions, quiz attempts, progress, or certificates
- **File:** `coursesController.js` (L232-268)
- **Problem:** When an instructor deletes their own course, it only removes Modules, Lessons, and Enrollments. Quizzes, Questions, QuizAttempts, LessonProgress, Certificates, and Discussions are all orphaned.
- **Compare:** The admin's `deleteCourse` in `adminController.js` properly cascades all related data. The instructor version is incomplete.

### 4. Missing backend endpoint — `GET /quizzes/course/:courseId/status`
- **File:** `LearningPage.jsx` (L38-43)
- **Problem:** The frontend calls `api.get('/quizzes/course/${courseId}/status')` but this route does NOT exist in `quizzesRoutes.js`. This will return a **404 error** on every learning page load, silently breaking quiz status indicators.

### 5. `CourseDetail.jsx` — Crash on enroll when course has no modules
- **File:** `CourseDetail.jsx` (L36)
- **Problem:** After enrolling, navigates to `course.modules[0].lessons[0]._id`. If the course has no modules or the first module has no lessons, this will throw a **TypeError** and crash.
- **Code:**
  ```js
  navigate(`/learning/${id}/${course.modules[0].lessons[0]._id}`);  // ❌ no null check
  ```

### 6. `useProgress` sends wrong field name to backend
- **File:** `useProgress.js` (L16-22) vs `progressController.js` (L58)
- **Problem:** The hook sends `{ lesson: lessonId }` but the controller reads `req.body.lessonId || req.body.lesson`. The field `totalDuration` is sent but controller reads `req.body.duration || req.body.totalDuration`. This works only because of the fallback `||` chains, but the primary field name mismatches indicate fragile coupling.

---

## 🟠 Major Issues (Functional problems or security risks)

### 7. No ownership check on quiz CRUD routes
- **File:** `quizzesRoutes.js`
- **Problem:** Any instructor can create/update/delete quizzes and questions for ANY course, not just their own. There's no check that the instructor owns the course associated with the quiz.

### 8. Prev/Next lesson buttons in LearningPage are non-functional
- **File:** `LearningPage.jsx` (L223-224)
- **Problem:** The "Prev" and "Next Lesson" buttons have no `onClick` handlers — they do nothing when clicked.
- **Code:**
  ```jsx
  <Button variant="outlined" startIcon={<ChevronLeft />}>Prev</Button>
  <Button variant="contained" endIcon={<ChevronRight />}>Next Lesson</Button>
  ```

### 9. `CourseDetail.jsx` shows hardcoded "10 hours of video lessons"
- **File:** `CourseDetail.jsx` (L133)
- **Problem:** The course details card always says "10 hours of video lessons" regardless of actual content. Should be calculated from lesson durations.

### 10. Admin can delete themselves
- **File:** `AdminDashboard.jsx` / `adminController.js`
- **Problem:** No check prevents an admin from deleting their own account, which would lock them out of the system entirely.

### 11. `register` allows `admin` role to be set indirectly
- **File:** `authController.js` (L24)
- **Problem:** The code only allows `learner` or `instructor` roles, defaulting to `learner`. This is correct, BUT there's no route/mechanism to create an admin user at all (only via direct DB manipulation).

### 12. `LearningPage` video ref type mismatch
- **File:** `LearningPage.jsx` (L150)
- **Problem:** `playerRef` is used as both a React ref for native `<video>` elements AND for `ReactPlayer`. The native video branch passes `ref={playerRef}` to a `<Box component="video">`, but `Box` uses `ref` differently. The `handleProgress` function calls `playerRef.current?.getDuration?.()` which is a ReactPlayer API — won't exist on native video elements.

---

## 🟡 Medium Issues (Code quality, performance, UX)

### 13. `getMyEnrollments` has N+1 query problem
- **File:** `enrollmentsController.js` (L54-71)
- **Problem:** For each enrollment, it runs 2 separate DB queries (`countDocuments` for total lessons AND completed lessons). With 20 enrollments, that's 40+ extra DB calls. Should use aggregation.

### 14. `isModuleUnlocked` is duplicated
- **Files:** `quizzesController.js` (L7-26) AND `progressController.js` (L8-27)
- **Problem:** Exact same function defined in two controllers. Should be extracted to a shared utility.

### 15. `syncEnrollmentProgress` re-imports models dynamically
- **File:** `progressController.js` (L30)
- **Problem:** Uses `await import("../models/Lesson.js")` inside the function instead of a top-level import. The Lesson model is already importable at the top of the file (and IS imported at L1).

### 16. No input validation on registration
- **File:** `authController.js` (L21-45)
- **Problem:** No email format validation, no password strength requirements. A user can register with `password: "1"`.

### 17. `console.log('DEBUG:...')` left in production code
- **File:** `LearningPage.jsx` (L125)
- **Problem:** Debug log statement `console.log('DEBUG: Resolved Video URL:', resolvedUrl)` should be removed.

### 18. Progress sidebar uses unnecessary IIFE
- **File:** `LearningPage.jsx` (L255-265)
- **Problem:** The progress bar section is wrapped in `{(() => { return (...) })()}` — an immediately invoked function expression that serves no purpose. It can just be inline JSX.

### 19. `CourseDetail` enrollment query swallows errors silently
- **File:** `CourseDetail.jsx` (L21-29)
- **Problem:** The `try/catch` returns `null` on any error, including 500 server errors. The user gets no feedback if the enrollment check fails for a real reason.

### 20. `getAdminUsers` searches only by email, not by name
- **File:** `adminController.js` (L14-18)
- **Problem:** The search query only filters by email regex. Users can't be found by name in the admin panel.

---

## 🔵 Minor Issues (Style, consistency, cleanup)

### 21. MUI Grid v2 usage inconsistency
- **Multiple files:** `Dashboard.jsx`, `CourseManagement.jsx`, `CourseDetail.jsx`, `AdminDashboard.jsx`
- **Problem:** Uses `<Grid xs={12}>` (MUI v2 unstable Grid) without the `item` prop. This works with MUI v6+ but will produce warnings in MUI v5.

### 22. `lesson.duration` vs `lesson.durationSeconds` inconsistency
- **File:** `CourseDetail.jsx` (L74) shows `lesson.duration || 5` but the Lesson model field is `durationSeconds`.

### 23. `CourseForm.jsx` — deprecated MUI `InputProps`
- **File:** `CourseForm.jsx` (L135)
- **Problem:** Uses `InputProps` which is deprecated in MUI v6+. Should use `slotProps.input` instead.

### 24. No loading states on several pages
- **Files:** `AdminDashboard.jsx`, `CourseCatalog.jsx`
- **Problem:** These pages return `undefined` while loading (no loading check), causing layout flash.

### 25. Hardcoded fallback JWT secret
- **File:** `authMiddleware.js` (L14), `authController.js` (L8)
- **Problem:** `process.env.JWT_SECRET || "dev-secret"` — if `.env` is missing, the app runs with a publicly known secret. Should fail fast in production.

### 26. `User.select("-password")` in admin queries doesn't match schema
- **File:** `adminController.js` (L21, L40)
- **Problem:** The User model uses `passwordHash` not `password`. `.select("-password")` does nothing — the password hash is still returned.

### 27. No `404` catch-all route
- **File:** `app.js`
- **Problem:** Unknown routes fall through to the error handler with no specific "route not found" message.

### 28. Missing `Lesson` model import in `coursesController.js`
- **File:** `coursesController.js` (L246)
- **Problem:** Uses `mongoose.model('Lesson')` dynamically but the Lesson model may not be registered yet if it hasn't been imported elsewhere first. Works by luck because other files import it.

---

## 📊 Summary

| Severity | Count | Impact |
|----------|-------|--------|
| 🔴 Critical | 6 | Crashes, data loss, broken features |
| 🟠 Major | 6 | Security holes, dead features, bad UX |
| 🟡 Medium | 8 | Performance, code smell, maintainability |
| 🔵 Minor | 8 | Consistency, deprecation, cleanup |
| **Total** | **28** | |

---

## 🎯 Recommended Fix Priority

1. **Fix admin `deleteUser` field names** (#2) — data leak on every delete
2. **Add missing `/quizzes/course/:courseId/status` route** (#4) — 404 on learning page
3. **Fix `deleteCourse` cascade** (#3) — orphaned data
4. **Add null checks on enrollment navigation** (#5) — crash
5. **Add ownership checks on quiz routes** (#7) — security
6. **Wire up Prev/Next buttons** (#8) — dead UI
7. **Remove duplicate `authorize`** (#1) — maintenance trap
8. **Fix `User.select("-password")`** (#26) — password hash leak to admin frontend
