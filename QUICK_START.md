# 🚀 Quick Start Testing Guide

## Installation & Setup

### Backend Tests
```bash
cd Backend
npm install
npm test
```

### Frontend Tests
```bash
cd Frontend
npm install
npm test
```

## Running Tests

### All Tests
```bash
# Backend
cd Backend && npm test

# Frontend  
cd Frontend && npm test
```

### With Coverage
```bash
# Backend
cd Backend && npm run test:coverage

# Frontend
cd Frontend && npm run test:coverage
```

### Watch Mode (Development)
```bash
# Backend
cd Backend && npm run test:watch

# Frontend
cd Frontend && npm run test:watch
```

## Test Files Overview

### Backend Unit Tests (tests/unit/)
- `auth.service.test.js` - Authentication (US-001 to US-005)
- `appointments.service.test.js` - Appointments (US-011 to US-017)
- `doctors.service.test.js` - Doctor Management (US-006 to US-010)
- `schedules.service.test.js` - Schedules (US-018 to US-022)

### Backend Integration Tests (tests/integration/)
- `auth.integration.test.js` - Auth API flows
- `appointments.integration.test.js` - Appointment API flows

### Frontend Unit Tests (tests/unit/components/)
- `Login.test.jsx` - Login component (US-003)
- `Register.test.jsx` - Registration (US-001, US-002, US-004)
- `BookAppointment.test.jsx` - Booking flow (US-007, US-008, US-011)

### E2E Test Scenarios (tests/e2e/)
- `E2E_TEST_SCENARIOS.md` - 10 comprehensive scenarios

## Quick Commands Reference

```bash
# Run specific test file
npm test -- auth.service.test.js

# Run tests matching pattern
npm test -- --testNamePattern="Patient Registration"

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Expected Results

✅ 160+ Backend Unit Tests  
✅ 50+ Backend Integration Tests  
✅ 110+ Frontend Unit Tests  
✅ 70%+ Code Coverage  
✅ All tests passing

## Troubleshooting

**Tests not running?**
- Check Node.js version (18+)
- Run `npm install` first
- Clear cache: `npm test -- --clearCache`

**Coverage not generating?**
- Use `npm run test:coverage`
- Check `coverage/index.html` for report

**Port conflicts?**
- Stop other running instances
- Check Backend is on port 3000
- Check Frontend is on port 5173

## Documentation

📖 Full documentation: `TESTING_PACKAGE_README.md`  
📝 E2E scenarios: `tests/e2e/E2E_TEST_SCENARIOS.md`  
🎯 User stories: `TESTING_PACKAGE_README.md` (Traceability Matrix)

## For Academic Grading

1. ✅ Run all tests: `npm test` in both Backend and Frontend
2. ✅ Generate coverage: `npm run test:coverage`
3. ✅ Review traceability in test file comments
4. ✅ Check `TESTING_PACKAGE_README.md` for full details

---

**All tests should pass. If any fail, check the error messages and ensure dependencies are installed.**

Good luck! 🎓
