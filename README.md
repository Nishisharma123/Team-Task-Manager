# TaskFlow — Team Task Manager

A full-stack web app for teams to create projects, assign tasks, and track progress with role-based access control.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens)
- **Deployment**: Railway (recommended)

---

## Features
- Authentication (Signup/Login with JWT)
- Project & team management with color coding
- Task creation, assignment & status tracking (Kanban board)
- Dashboard with stats & overdue tracking
- Role-based access (Admin/Member)
- Member search & invite by email

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env        # Edit with your MongoDB URI & JWT secret
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit: http://localhost:5173

---

## Deployment on Railway

### Backend
1. Create a new Railway project
2. Add a MongoDB plugin (or use MongoDB Atlas)
3. Deploy backend directory
4. Set environment variables:
   - `MONGODB_URI` (from Railway MongoDB or Atlas)
   - `JWT_SECRET` (random strong string)
   - `CLIENT_URL` (your frontend Railway URL)
   - `NODE_ENV=production`

### Frontend
1. Add another Railway service for the frontend
2. Set build command: `npm run build`
3. Set start command: `npx serve dist`
4. Set env variable: `VITE_API_URL` (your backend Railway URL)

> **Note**: Update `vite.config.js` proxy target with the backend URL for production, or use `axios` baseURL from `VITE_API_URL`.

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks?project=:id` | List tasks for project |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/dashboard/overview` | Dashboard stats |

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── models/        # Mongoose models (User, Project, Task)
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Auth middleware
│   │   └── index.js       # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── context/       # React context (Auth)
    │   └── utils/         # API utility
    ├── index.html
    └── package.json
```
