# Frontend - Layered Monolithic Architecture

## Project Structure

```
Frontend/
├── public/                      # Static assets
│   ├── index.html              # HTML entry point
│   └── assets/
│       ├── images/             # Image assets
│       └── icons/              # Icon assets
│
├── src/
│   ├── index.js                # Application entry point
│   ├── App.js                  # Root component
│   ├── routes.js               # Application routing
│   │
│   ├── config/                 # Configuration files
│   │   ├── api.config.js       # API base URL and settings
│   │   └── constants.js        # App-wide constants
│   │
│   ├── shared/                 # Shared/common resources
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   └── useForm.js
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── storage.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── services/           # Shared API services
│   │   │   ├── api.service.js  # Base API client (fetch/axios wrapper)
│   │   │   └── http.service.js # HTTP interceptors and error handling
│   │   │
│   │   └── contexts/           # React Context providers
│   │       ├── AuthContext.jsx
│   │       ├── ThemeContext.jsx
│   │       └── NotificationContext.jsx
│   │
│   └── features/               # Feature modules (domain-driven)
│       │
│       ├── auth/
│       │   ├── components/     # Auth-specific components
│       │   │   ├── LoginForm.jsx
│       │   │   ├── RegisterForm.jsx
│       │   │   ├── ForgotPasswordForm.jsx
│       │   │   └── ChangePasswordForm.jsx
│       │   │
│       │   ├── pages/          # Auth pages
│       │   │   ├── LoginPage.jsx
│       │   │   ├── RegisterPage.jsx
│       │   │   ├── ForgotPasswordPage.jsx
│       │   │   └── ProfilePage.jsx
│       │   │
│       │   └── services/       # Auth API calls
│       │       └── auth.service.js
│       │
│       ├── doctors/
│       │   ├── components/
│       │   │   ├── DoctorCard.jsx
│       │   │   ├── DoctorList.jsx
│       │   │   ├── DoctorSearchBar.jsx
│       │   │   ├── DoctorFilters.jsx
│       │   │   └── DoctorProfile.jsx
│       │   │
│       │   ├── pages/
│       │   │   ├── DoctorsPage.jsx
│       │   │   ├── DoctorDetailPage.jsx
│       │   │   └── DoctorSearchPage.jsx
│       │   │
│       │   └── services/
│       │       └── doctors.service.js
│       │
│       ├── patients/
│       │   ├── components/
│       │   │   ├── PatientCard.jsx
│       │   │   ├── PatientList.jsx
│       │   │   └── PatientForm.jsx
│       │   │
│       │   ├── pages/
│       │   │   ├── PatientsPage.jsx
│       │   │   ├── PatientDetailPage.jsx
│       │   │   └── PatientDashboardPage.jsx
│       │   │
│       │   └── services/
│       │       └── patients.service.js
│       │
│       ├── appointments/
│       │   ├── components/
│       │   │   ├── AppointmentCard.jsx
│       │   │   ├── AppointmentList.jsx
│       │   │   ├── AppointmentForm.jsx
│       │   │   ├── AppointmentCalendar.jsx
│       │   │   └── CancelAppointmentModal.jsx
│       │   │
│       │   ├── pages/
│       │   │   ├── AppointmentsPage.jsx
│       │   │   ├── BookAppointmentPage.jsx
│       │   │   ├── AppointmentDetailPage.jsx
│       │   │   └── MyAppointmentsPage.jsx
│       │   │
│       │   └── services/
│       │       └── appointments.service.js
│       │
│       └── schedules/
│           ├── components/
│           │   ├── ScheduleCalendar.jsx
│           │   ├── ScheduleForm.jsx
│           │   ├── TimeSlotPicker.jsx
│           │   └── WeeklyScheduleView.jsx
│           │
│           ├── pages/
│           │   ├── SchedulesPage.jsx
│           │   ├── ManageSchedulePage.jsx
│           │   └── DailySchedulePage.jsx
│           │
│           └── services/
│               └── schedules.service.js
│
├── package.json                # Project dependencies and scripts
├── .env                        # Environment variables
├── .env.example                # Example environment variables
└── .gitignore                  # Git ignore rules
```

## Architecture Layers

### 1. Presentation Layer (Pages & Components)
- **Pages**: Top-level route components
- **Components**: Reusable UI elements specific to features
- **Shared Components**: Cross-feature reusable UI components

### 2. Business Logic Layer (Services)
- Feature-specific services for API communication
- Data transformation and business rules
- Shared services for common operations

### 3. Data Access Layer (API Services)
- Base API client configuration
- HTTP interceptors
- Request/response handling

### 4. Cross-Cutting Concerns (Shared)
- **Contexts**: Global state management
- **Hooks**: Reusable React hooks
- **Utils**: Helper functions and utilities
- **Config**: Application configuration

## Key Principles

1. **Separation of Concerns**: Each layer has distinct responsibilities
2. **Feature-Based Organization**: Code organized by business domain
3. **Reusability**: Shared components and utilities
4. **Scalability**: Easy to add new features without affecting existing code
5. **Maintainability**: Clear structure and consistent patterns

## File Naming Conventions

- Components: PascalCase (e.g., `DoctorCard.jsx`)
- Services: camelCase with `.service.js` suffix (e.g., `auth.service.js`)
- Utilities: camelCase with descriptive names (e.g., `validators.js`)
- Hooks: camelCase starting with `use` (e.g., `useAuth.js`)
- Pages: PascalCase with `Page` suffix (e.g., `LoginPage.jsx`)
