# Mini Learning Management System

MERN LMS project scaffold for role-based course publishing, enrollment, video progress tracking, quizzes, certificates, analytics, and discussions.

## Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
├── collections/
└── docs/
```

## Planned Backend Areas

- `models`: User, Course, Module, Lesson, Quiz, Question, Enrollment, LessonProgress, QuizAttempt, Certificate, Discussion.
- `controllers`: request handlers grouped by feature.
- `routes`: Express route modules grouped by API area.
- `middleware`: JWT authentication, role authorization, validation, and error handling.

## Planned Frontend Areas

- `api`: server-state clients and React Query request helpers.
- `components`: reusable UI pieces kept flat for this small project.
- `hooks`: reusable hooks such as video progress saving.
- `context`: enrolled-course shell state.
- `pages`: route screens kept flat for easier navigation.
- `routes`: nested React Router definitions and route guards.
- `styles`: global styles and responsive layout rules.

## Environment

Copy `.env.example` to `.env` and fill in real values before running the app.

## API Documentation

Endpoint notes and curl examples belong in `docs/api/endpoints.md`.

## Walkthrough

Add the 5-8 minute demo script or Loom notes in `docs/walkthrough/demo-script.md`.
