# 🏥 Se7ety Healthcare Platform

A modern, full-stack healthcare management system built with **Express.js**, **React**, and **Supabase**. This application enables patients to book appointments with doctors, manage their medical profiles, and facilitates doctors in managing their schedules and patient interactions.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **User Registration & Login** - Support for Patient and Doctor roles
- **JWT-based Authentication** - Secure token-based session management
- **Role-Based Access Control (RBAC)** - Admin, Doctor, and Patient roles with specific permissions
- **Password Security** - Bcrypt hashing with requirement enforcement
- **Password Reset** - Secure password recovery functionality

### 📅 Appointment Management
- **Book Appointments** - Patients can schedule appointments with doctors
- **Appointment Scheduling** - Conflict detection and time slot availability
- **View & Filter** - Filter appointments by patient, doctor, date, and status
- **Appointment History** - Access upcoming and past appointment records
- **Cancellation** - Cancel appointments with soft-delete support

### 👨‍⚕️ Doctor Management
- **Public Doctor Directory** - Browse doctors without authentication
- **Advanced Search** - Find doctors by specialty, name, and availability
- **Doctor Profiles** - Detailed doctor information including qualifications
- **Schedule Management** - Doctors can manage their availability
- **Admin Controls** - Create and manage doctor accounts

### 💬 Messaging System
- **Real-time Communication** - Socket.io-powered instant messaging
- **Message History** - Store and retrieve conversation threads
- **Doctor-Patient Interaction** - Secure messaging between healthcare providers and patients

### ⭐ Reviews & Ratings
- **Doctor Reviews** - Patients can rate and review doctors
- **Rating System** - 5-star rating for service quality
- **Public Reviews** - View other patients' feedback

### 📊 Admin Dashboard
- **System Analytics** - View user and appointment statistics
- **User Management** - Manage doctors and patient accounts
- **System Monitoring** - Track system health and performance

---

## 🛠 Tech Stack

### **Backend**
| Technology | Purpose |
|---|---|
| **Node.js + Express.js** | RESTful API server |
| **Supabase (PostgreSQL)** | Cloud database with authentication |
| **JWT** | Secure authentication tokens |
| **Bcrypt** | Password hashing and security |
| **Socket.io** | Real-time messaging |
| **Jest + Supertest** | Unit and integration testing |
| **Nodemon** | Development auto-reload |

### **Frontend**
| Technology | Purpose |
|---|---|
| **React 18** | UI component library |
| **Vite** | Fast build tool and dev server |
| **Axios** | HTTP client for API calls |
| **Radix UI** | Accessible UI components |
| **Vitest** | Unit testing framework |
| **Tailwind CSS** | Utility-first CSS styling |

### **Testing & Quality**
- **Jest** - Unit testing framework
- **Supertest** - HTTP assertion library
- **Vitest** - Frontend testing framework
- **Playwright** - E2E testing
- **ESLint** - Code quality linting

---

## 🏗️ Architecture

This project follows a **Feature-Based Layered Monolith** architecture pattern:

```
┌─────────────────────────────────────────────────┐
│         PRESENTATION LAYER                      │
│   (Controllers + Routes)                        │
│   - HTTP request/response handling              │
│   - Input validation & routing                  │
│   - Response formatting                         │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│         BUSINESS LOGIC LAYER                    │
│   (Services)                                    │
│   - Business rules & workflows                  │
│   - Data transformation                         │
│   - Error handling & validation                 │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│         DATA ACCESS LAYER                       │
│   (Repositories)                                │
│   - Database queries & operations               │
│   - Data mapping & transformation               │
│   - CRUD operations                             │
└─────────────────────────────────────────────────┘
```

### **Architecture Principles**
1. **Feature-Based Organization** - Code organized by business domain (auth, appointments, doctors, etc.)
2. **Separation of Concerns** - Each layer has distinct responsibilities
3. **Single Monolith Deployment** - All features in one application
4. **API Versioning** - All endpoints prefixed with `/api/v1/`
5. **Shared Infrastructure** - Common middleware, utilities, and validators


---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up](https://supabase.com/))

### Verify Installation
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show git version
```

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/Software-Testing-Project.git
cd Software-Testing-Project
```

### Step 2: Install Backend Dependencies
```bash
cd Backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../Frontend
npm install
```

### Step 4: Install E2E Testing Dependencies (Optional)
```bash
cd ../tests/e2e
npm install
```

### Step 5: Configure Environment Variables

#### Backend Setup
Create a `.env` file in the `Backend/` directory:

```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
```

#### Frontend Setup
Create a `.env` file in the `Frontend/` directory:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

---

## 🏃 Running the Application

### Option 1: Run Everything in Separate Terminals

**Terminal 1 - Backend Server:**
```bash
cd Backend
npm run dev
```
✅ Backend will start on `http://localhost:3000`
- Health check: `http://localhost:3000/health`

**Terminal 2 - Frontend Dev Server:**
```bash
cd Frontend
npm run dev
```
✅ Frontend will start on `http://localhost:5173`

**Terminal 3 - E2E Tests (Optional):**
```bash
cd tests/e2e
npm run test
```

### Option 2: Using Terminal Commands
```powershell
# Windows PowerShell

# Backend
Start-Process powershell { cd Backend; npm run dev }

# Frontend  
Start-Process powershell { cd Frontend; npm run dev }
```

### Verify Installation
Once both servers are running:
1. Open `http://localhost:5173` in your browser
2. The frontend automatically checks backend health
3. Check browser console for status messages
4. Try logging in or creating a new account

---

## 🧪 Testing

### Backend Tests

**Run all tests:**
```bash
cd Backend
npm test
```

**Run specific test suites:**
```bash
# Unit tests
npm test -- tests/unit

# Integration tests  
npm test -- tests/integration

# Watch mode (auto-rerun on changes)
npm test -- --watch
```

**Run with coverage:**
```bash
npm test -- --coverage
```

### Frontend Tests

**Run unit tests:**
```bash
cd Frontend
npm run test
```

**Watch mode:**
```bash
npm run test:watch
```

**UI test dashboard:**
```bash
npm run test:ui
```

**Coverage report:**
```bash
npm run test:coverage
```

### E2E Tests

**Run all E2E tests:**
```bash
cd tests/e2e
npm run test
```

**Run in headed mode (see browser):**
```bash
npm run test:headed
```

**Run specific test:**
```bash
npm run test -- spec-name.spec.js
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login user |
| `POST` | `/auth/refresh` | Refresh JWT token |
| `POST` | `/auth/logout` | Logout user |
| `POST` | `/auth/forgot-password` | Request password reset |

#### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/appointments` | List user appointments |
| `POST` | `/appointments` | Create appointment |
| `GET` | `/appointments/:id` | Get appointment details |
| `PUT` | `/appointments/:id` | Update appointment |
| `DELETE` | `/appointments/:id` | Cancel appointment |

#### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/doctors` | List all doctors |
| `GET` | `/doctors/:id` | Get doctor details |
| `GET` | `/doctors/search?specialty=...` | Search doctors |

#### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/patients/:id` | Get patient profile |
| `PUT` | `/patients/:id` | Update patient profile |

#### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/reviews` | Create review |
| `GET` | `/reviews/doctor/:doctorId` | Get doctor reviews |

For detailed API documentation, see [API_TESTING_GUIDE.md](./Backend/API_TESTING_GUIDE.md)

---


### Frontend Variables
```
VITE_API_BASE_URL     - Backend API base URL
VITE_SOCKET_URL       - WebSocket server URL
```

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

#### Database Connection Error
- Verify Supabase credentials in `.env`
- Check internet connection to Supabase
- Ensure Supabase project is active
- Check database connection string format

#### Frontend can't reach Backend
- Verify backend is running on `http://localhost:3000`
- Check `VITE_API_BASE_URL` in Frontend `.env`
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in Backend `.env`

#### Tests Failing
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear test cache: `npm test -- --clearCache`
- Check test database connection
- Review test output for specific errors

#### Dependencies Conflict
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Additional Documentation

- [Backend Architecture Guide](./Backend/README_LAYERED_MONOLITH.md)
- [API Testing Guide](./Backend/API_TESTING_GUIDE.md)
- [TDD Implementation](./TDD_PRINCIPLES_IMPLEMENTATION.md)
- [Integration Documentation](./INTEGRATION_COMPLETE.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** thoroughly: `npm test`
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and architecture patterns
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---


## 🙏 Acknowledgments

- Supabase for amazing backend infrastructure
- React and Express.js communities
- All contributors and testers

---

**Made with ❤️ by the Se7ety Team**

Last Updated: January 2026
Frontend/ # React + Vite feature-oriented UI
```

## Common Issues
- Missing Supabase env vars: backend will throw during startup (ensure `.env` filled).
- Wrong API base: adjust `REACT_APP_API_BASE_URL` if backend port/version differ.
- Health endpoint not versioned: always `/health` at server root.

## Scripts
Frontend:
- `npm run dev` – start Vite
- `npm run build` – production build

Backend:
- `npm run dev` – nodemon development
- `npm start` – production mode

## Testing
Use `Backend/test-api.html` to manually exercise auth & appointments after backend starts.

## License
ISC

---
Generated integration README section to facilitate testing website end-to-end.
