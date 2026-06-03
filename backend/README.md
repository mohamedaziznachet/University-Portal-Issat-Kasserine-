# University Portal Backend (Node + Express + MongoDB)

## Actors
- `student`
- `teacher`
- `admin`
- `visitor` (tracked in `VisitorLog`, can also exist as `User` with role visitor)

## Main Collections
- `User`
- `Course`
- `Assignment`
- `Submission` (graded on /20)
- `Post` (news/events/agenda/tenders/notices)
- `SitePage` (CMS pages)
- `GalleryItem`
- `ContactMessage`
- `Enrollment`
- `VisitorLog`

## API Overview

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Learning
- `POST /api/courses` (teacher/admin)
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/assignments` (teacher/admin)
- `GET /api/assignments`
- `POST /api/assignments/:assignmentId/submissions` (student)
- `GET /api/assignments/:assignmentId/submissions` (teacher/admin)
- `PATCH /api/assignments/submissions/:submissionId/grade` (teacher/admin)

### Public Website Content
- `GET /api/public/posts?type=news`
- `GET /api/public/pages/:slug`
- `GET /api/public/gallery`
- `POST /api/public/contact`

### Admin CMS
- `POST /api/admin/posts`
- `PUT /api/admin/pages`
- `POST /api/admin/gallery`
- `GET /api/admin/contact-messages`
- `PATCH /api/admin/contact-messages/:id`
- `POST /api/admin/enrollments`

## Run
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

## Seed demo data
```bash
cd backend
npm run seed
```

Seed creates demo accounts:
- admin: `00000001 / Admin@123`
- teacher: `11111111 / Teacher@123`
- student: `22222225 / Student@123`
