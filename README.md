# Software-Testing-Project

Se7ety Healthcare full-stack application (Frontend + Backend) using a layered monolith architecture and feature-based React structure.

## Quick Start

### 1. Clone & Install
```powershell
git clone <repo-url>
cd Software-Testing-Project\Backend; npm install
cd ..\Frontend; npm install
```

### 2. Environment Setup
Create `.env` files based on the provided `.env.example` in each folder.

Backend `.env.example` required values:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
FRONTEND_URL=http://localhost:3000
```

Frontend `.env.example`:
```
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Run Backend
```powershell
cd Backend
npm run dev
```
Backend health: http://localhost:3000/health

### 4. Run Frontend (Vite Dev Server)
```powershell
cd Frontend
npm run dev
```
Open http://localhost:5173 (or printed Vite port).

### 5. Test Integration
Home page performs automatic health check and shows backend status. Open browser console for toast notifications.

## Folder Overview
```
Backend/  # Express layered monolith API
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