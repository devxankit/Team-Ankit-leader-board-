# Full-Stack Starter Template (MERN Boilerplate)

A clean, production-ready full-stack web application starter template. Reuse this project whenever starting any new project to save setup time.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js (ES Modules), MongoDB & Mongoose ORM, JWT Authentication, Zod validation, Helmet, CORS, Rate Limiting, Nodemailer
- **Frontend**: React 19, Vite, React Router DOM v7, TailwindCSS, Motion, React Hook Form
- **Pre-configured Systems**:
  - Authentication & Role-Based Access Control (Admin & User roles)
  - Admin Dashboard with metrics and user management
  - Responsive public layouts (Header, Footer, Mobile Drawer)
  - Centralized Environment & Database configurations
  - Automated seeding script with default credentials

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds default admin and demo user
npm run dev      # Starts API server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Default Credentials

- **Admin Account**:
  - **Email**: `admin@example.com`
  - **Password**: `Admin@123456`
  - **Portal**: `http://localhost:5173/admin/login`

- **Demo User Account**:
  - **Email**: `user@example.com`
  - **Password**: `User@123456`

---

## 📁 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & env configurations
│   │   ├── controllers/     # Auth & Users business logic
│   │   ├── middleware/      # JWT protection, rate limiting, error handlers
│   │   ├── models/          # Mongoose data schemas (User)
│   │   ├── routes/          # Express API route declarations
│   │   ├── scripts/         # Database seeding script (seed.js)
│   │   ├── services/        # Captcha & email services
│   │   ├── utils/           # ApiError & helper utilities
│   │   ├── validation/      # Zod validation schemas
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server listener
│   └── .env                 # Backend environment variables
│
└── frontend/
    ├── src/
    │   ├── components/      # UI components, layout, and protected route guards
    │   ├── context/         # AuthContext (login, register, logout, session)
    │   ├── data/            # Navigation items & static data
    │   ├── layouts/         # MainLayout (public) & AdminLayout (dashboard)
    │   ├── pages/           # Home, About, Contact, Login, Admin pages
    │   ├── routes/          # AppRoutes & ScrollToTop
    │   ├── services/        # Axios / Fetch API client (api.js)
    │   ├── App.jsx          # Root component
    │   └── main.jsx         # Application entry
    └── .env                 # Frontend environment variables
```
