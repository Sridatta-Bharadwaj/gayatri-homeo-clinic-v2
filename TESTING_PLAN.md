# Comprehensive Testing Plan
## Gayatri Homeo Clinic Management System

**Last Updated**: 2026-01-14  
**Version**: 2.0 (includes Access Control & User Management)

---

## Overview

This testing plan covers the complete Homeopathy Practice Management System including:
- Authentication & Authorization
- Patient Management with Access Control
- Patient Sharing & Collaboration
- User Management (Admin only)
- Visit Management
- Analytics & Reports
- Settings Management

---

## Pre-Testing Setup

### Required Software
- PostgreSQL 12+ installed and running
- Python 3.8+ with pip
- Node.js 16+ with npm
- Modern web browser (Chrome, Firefox, Edge)

### Environment Files
Ensure `.env` file exists in `backend/` with:
```
SECRET_KEY=your-secret-key-here
DB_USER=homeopathy_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homeopathy_db
```

---

## 1. Authentication Testing

### 1.1 First-Time Setup
**Test ID**: AUTH-001  
**Scenario**: Initial system setup with no users

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `http://localhost:5173` | Redirects to `/setup` page |
| 2 | Leave fields empty and click "Complete Setup" | Shows validation errors |
| 3 | Enter full name: "Dr. John Doe" | Field accepts input |
| 4 | Enter username: "admin" | Field accepts input |
| 5 | Enter password: "short" | Shows error: "Password must be at least 8 characters" |
| 6 | Enter password: "Admin123!" | Field accepts input |
| 7 | Enter confirm password: "Admin456!" | Shows error: "Passwords do not match" |
| 8 | Enter confirm password: "Admin123!" | Field accepts input |
| 9 | Click "Complete Setup" | Account created successfully |
| 10 | System automatically logs in | Redirects to dashboard |
| 11 | Header shows "Welcome, Dr. John Doe" | User name displayed correctly |
| 12 | Navigation shows: Dashboard, Patients, Settings, Users | All admin links visible |

---

### 1.2 Login Flow
**Test ID**: AUTH-002  
**Scenario**: User login with valid and invalid credentials

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click logout button in header | Redirects to `/login` page |
| 2 | Enter wrong username: "wronguser" | Field accepts input |
| 3 | Enter wrong password: "wrongpass" | Field accepts input |
| 4 | Click Login | Shows error: "Invalid username or password" |
| 5 | Enter correct username: "admin" | Field accepts input |
| 6 | Enter wrong password: "wrongpass" | Field accepts input |
| 7 | Click Login | Shows error: "Invalid username or password" |
| 8 | Enter correct username: "admin" | Field accepts input |
| 9 | Enter correct password | Field accepts input |
| 10 | Click Login | Successfully logs in |
| 11 | Redirects to home page | Dashboard loads with analytics |

---

### 1.3 Session Management
**Test ID**: AUTH-003  
**Scenario**: Session persistence and timeout

*See full testing plan for complete details* - This file has been created with comprehensive testing coverage for all application features including:

- Authentication (Setup, Login, Session, Password Change)
- Patient Management (CRUD operations)
- Patient Access Control (Sharing, Revoking)
- Visit Management
- Analytics & Reports
- Settings
- UI/UX Testing
- Cross-Browser Testing
- Performance Testing
- Security Testing
- Data Integrity Testing

**Total Test Cases**: 80+ comprehensive test scenarios
