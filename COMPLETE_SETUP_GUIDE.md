# Complete Setup & Testing Guide
## Gayatri Homeo Clinic Management System

---

## 📋 Pre-Requisites

Before starting, ensure you have:
- ✅ PostgreSQL installed and running
- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed
- ✅ Git (to clone/navigate the project)

---

## 🚀 Step-by-Step Setup from Scratch

### Step 1: Database Setup

#### 1.1 Start PostgreSQL
```cmd
# Check if PostgreSQL is running
pg_isready

# If not running, start it:
# Windows: Services → PostgreSQL → Start
# Or: pg_ctl start
```

#### 1.2 Reset Database (Clean Slate)
```cmd
# Navigate to backend directory
cd d:\Sridatta\projects_and_interships\gayatri-homeo-clinic\backend

# Run the migration script
psql -U homeopathy_user -d homeopathy_db -f migrate_and_reset.sql
```

**Expected Output:**
```
NOTICE:  Added created_by column to patients table
NOTICE:  Clearing all data from tables...
NOTICE:  All tables cleared successfully!
NOTICE:  Resetting auto-increment sequences...
NOTICE:  Sequences reset successfully!

 table_name     | count
----------------+-------
 users          |     0
 patients       |     0
 visits         |     0
 patient_access |     0
 settings       |     0
```

---

### Step 2: Backend Setup

#### 2.1 Install Dependencies (if not already done)
```cmd
# Make sure you're in the backend directory
cd backend

# Activate virtual environment (if using one)
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 2.2 Verify Environment Variables
Check that `backend/.env` exists and contains:
```
SECRET_KEY=your-secret-key-here
DB_USER=homeopathy_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homeopathy_db
```

#### 2.3 Start Backend Server
```cmd
# From backend directory
python run.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Restarting with stat
 * Debugger is active!
```

**✅ Checkpoint**: Leave this terminal running

---

### Step 3: Frontend Setup

#### 3.1 Open New Terminal
```cmd
# Navigate to frontend directory
cd d:\Sridatta\projects_and_interships\gayatri-homeo-clinic\frontend
```

#### 3.2 Install Dependencies (if not already done)
```cmd
npm install
```

#### 3.3 Start Frontend Dev Server
```cmd
npm run dev
```

**Expected Output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Checkpoint**: Leave this terminal running

---

### Step 4: Initial Access

#### 4.1 Open Application
```
Open browser and navigate to: http://localhost:5173
```

#### 4.2 Verify Redirect
- Should automatically redirect to `/setup` page
- If you see login page, database wasn't cleared properly (go back to Step 1.2)

---

## 🧪 Complete Testing Workflow

### Phase 1: Initial Setup (5 minutes)

#### Test 1.1: Create Admin Account
1. **Action**: Fill out setup form
   - Full Name: `Dr. Admin User`
   - Username: `admin`
   - Password: `Admin123!`
   - Confirm Password: `Admin123!`

2. **Click**: "Complete Setup"

3. **Expected**:
   - ✅ Success message
   - ✅ Auto-login
   - ✅ Redirect to dashboard
   - ✅ Header shows "Welcome, Dr. Admin User"
   - ✅ Navigation shows: Dashboard | Patients | Settings | **Users** (admin only)

---

### Phase 2: User Management (10 minutes)

#### Test 2.1: Create Doctor Accounts

1. **Navigate**: Click "Users" in navigation

2. **Expected**: Users page loads with table showing only admin user

3. **Action**: Click "Add User" button

4. **Fill Form**:
   - Full Name: `Dr. Sarah Smith`
   - Username: `sarah`
   - Password: `Doctor123!`
   - Role: `Doctor` (dropdown)
   - Active: ✅ (checked)

5. **Click**: "Create User"

6. **Expected**: User created, appears in table

7. **Repeat** for second doctor:
   - Full Name: `Dr. Mike Johnson`
   - Username: `mike`
   - Password: `Doctor123!`
   - Role: `Doctor`

8. **Expected**: Now have 3 users total (1 admin, 2 doctors)

#### Test 2.2: Edit User

1. **Action**: Click edit icon next to "Dr. Sarah Smith"

2. **Change**: Full Name to `Dr. Sarah Wilson`

3. **Click**: "Update User"

4. **Expected**: Name updated in table

#### Test 2.3: Role Verification

1. **Logout**: Click logout button

2. **Login as**: `sarah` / `Doctor123!`

3. **Expected**: 
   - ✅ Login successful
   - ✅ Navigation shows: Dashboard | Patients | Settings
   - ❌ NO "Users" link (not admin)

4. **Try to access**: `http://localhost:5173/users` directly

5. **Expected**: "Access Denied" message

---

### Phase 3: Patient Access Control (15 minutes)

#### Test 3.1: Create Patients as Different Doctors

**As Dr. Sarah:**
1. Navigate to `/patients/new`
2. Create patient:
   - Full Name: `John Doe`
   - DOB: `1980-05-15`
   - Gender: `Male`
   - Contact: `9876543210`
3. Click "Save Patient"
4. **Expected**: Patient created, redirects to patient detail

**Logout and login as Dr. Mike:**
1. Navigate to `/patients`
2. **Expected**: Empty patient list (cannot see Sarah's patient)

**As Dr. Mike:**
1. Create his own patient:
   - Full Name: `Jane Smith`  
   - DOB: `1990-08-20`
   - Gender: `Female`
   - Contact: `9876543211`
2. **Expected**: Patient created

**Verify Isolation:**
1. Navigate to `/patients`
2. **Expected**: Only sees "Jane Smith" (his own patient)
3. Try to access John Doe's URL directly (note the ID from Sarah's session)
4. **Expected**: 403 error "Access denied to this patient"

#### Test 3.2: Share Patient Access

**Login as Dr. Sarah:**
1. Navigate to her patient "John Doe"
2. Scroll to "Access Management" card
3. **Expected**: 
   - Shows "Creator: Dr. Sarah Wilson"
   - "Share Access" button visible

4. Click "Share Access"
5. **Expected**: Dialog opens with:
   - Comment textarea
   - List of other doctors (should show Dr. Mike Johnson)

6. **Action**:
   - Comment: `Second opinion needed for treatment plan`
   - ✅ Check "Dr. Mike Johnson"
   - Click "Share with 1 doctor(s)"

7. **Expected**:
   - Success message
   - Dialog closes
   - Access list now shows "Dr. Mike Johnson" with comment

**Login as Dr. Mike:**
1. Navigate to `/patients`
2. **Expected**: Now sees BOTH patients:
   - Jane Smith (his own)
   - John Doe (shared with him)

3. Click on "John Doe"
4. **Expected**:
   - Can view all details
   - Can edit patient info
   - Access Management shows "Creator: Dr. Sarah Wilson"
   - Shows "Shared with: You"
   - Delete button disabled or shows error (only creator can delete)

#### Test 3.3: Revoke Access

**Login as Dr. Sarah:**
1. Navigate to "John Doe" patient
2. In Access Management, find "Dr. Mike Johnson"
3. Click "Revoke" button (trash icon)
4. Confirm revocation
5. **Expected**: Dr. Mike removed from access list

**Login as Dr. Mike:**
1. Navigate to `/patients`
2. **Expected**: Only sees "Jane Smith" (his own patient again)
3. Try to access John Doe's URL
4. **Expected**: 403 error "Access denied"

---

### Phase 4: Admin Privileges (10 minutes)

#### Test 4.1: Admin Can See All Patients

**Login as admin:**
1. Navigate to `/patients`
2. **Expected**: Sees ALL patients:
   - John Doe (created by Sarah)
   - Jane Smith (created by Mike)

3. Click on any patient
4. **Expected**: Can view and edit all patients

5. **Note**: Admin bypasses all access control

#### Test 4.2: Admin User Management

**As admin:**
1. Navigate to `/users`
2. Try to delete "Dr. Sarah Wilson"
3. **Expected**: Delete works (with confirmation)

4. Try to delete your own admin account
5. **Expected**: Error "Cannot delete your own account"

6. Create another admin user:
   - Full Name: `Dr. Admin Two`
   - Username: `admin2`
   - Password: `Admin123!`
   - Role: `Admin`

7. Try to delete originaladmin
8. **Expected**: Works (not the last admin anymore)

9. Try to delete `admin2` (now the last admin)
10. **Expected**: Error "Cannot delete the last admin user"

---

### Phase 5: Visit Management with Access Control (10 minutes)

#### Test 5.1: Visits Follow Patient Access

**As Dr. Sarah (owns John Doe):**
1. Navigate to John Doe's detail page
2. Click "Add New Visit"
3. Create visit with:
   - Chief Complaint: `Headache`
   - Symptoms: `Persistent headache for 3 days`
   - Diagnosis: `Migraine`
   - Prescription: `Rest and hydration`

4. **Expected**: Visit created successfully

**As Dr. Mike (no access to John Doe yet):**
1. Try to access the visit URL directly
2. **Expected**: 403 error

**As Dr. Sarah:**
1. Share John Doe with Dr. Mike again
2. **Expected**: Access granted

**As Dr. Mike:**
1. Navigate to John Doe's visits
2. **Expected**: Can now see and edit the visit

---

### Phase 6: Reports & Settings (5 minutes)

#### Test 6.1: Generate Reports
1. Navigate to any patient detail page
2. Click "Generate Report"
3. **Expected**: PDF downloads with patient info

#### Test 6.2: Update Settings
1. Navigate to `/settings`
2. Update clinic information
3. Click "Save Clinic Information"
4. **Expected**: Settings saved successfully

#### Test 6.3: Change Password
1. Scroll to "Change Password" section
2. Enter current and new password
3. **Expected**: Password updated
4. Logout and login with new password
5. **Expected**: Login successful

---

## 📊 Test Results Checklist

Mark each test as you complete it:

### Authentication
- [ ] First-time setup works
- [ ] Login/logout works
- [ ] Session persists on refresh
- [ ] Session expires after 30 min
- [ ] Password change works

### User Management (Admin Only)
- [ ] Create doctor account
- [ ] Edit user details
- [ ] Delete user (with safeguards)
- [ ] Role dropdown styled correctly
- [ ] Non-admin cannot access /users
- [ ] Cannot delete self
- [ ] Cannot delete last admin

### Patient Access Control
- [ ] Doctors only see their own patients
- [ ] Share patient with multiple doctors
- [ ] Revoke patient access
- [ ] Admin sees all patients
- [ ] Access checks on all operations
- [ ] Only creator can delete patient

### Patient Management
- [ ] Create patient
- [ ] Edit patient
- [ ] Delete patient (creator only)
- [ ] Search patients
- [ ] View patient details

### Visit Management
- [ ] Add visit to patient
- [ ] Edit visit
- [ ] View visit history
- [ ] Visits follow patient access

### Reports
- [ ] Generate prescription PDF
- [ ] Generate patient report
- [ ] PDFs contain correct data

### UI/UX
- [ ] Navigation menu works
- [ ] Users link only shows for admin
- [ ] Dark/light theme toggle
- [ ] Responsive on mobile
- [ ] Loading states show
- [ ] Error messages clear

---

## 🐛 Common Issues & Solutions

### Issue: Can't access setup page
**Solution**: Database not empty
```cmd
cd backend
psql -U homeopathy_user -d homeopathy_db -c "DELETE FROM users;"
```
Refresh browser

### Issue: 403 errors everywhere
**Solution**: Clear browser storage
- F12 → Application → Clear Storage
- Refresh page

### Issue: Backend not starting
**Solution**: Check if port 5000 is in use
```cmd
netstat -ano | findstr :5000
# Kill the process if needed
```

### Issue: Frontend build errors
**Solution**: Reinstall dependencies
```cmd
cd frontend
rm -rf node_modules
npm install
```

---

## ✅ Success Criteria

System is ready for production when:
- ✅ All authentication tests pass
- ✅ User management works for admin
- ✅ Access control properly restricts patient access
- ✅ Patient sharing works between doctors
- ✅ Admin can see all patients
- ✅ Reports generate correctly
- ✅ No console errors in browser
- ✅ All CRUD operations work
- ✅ Security checks in place

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Check backend terminal for errors
3. Verify database connection
4. Review this guide from Step 1

---

**Setup Time Estimate**: 10-15 minutes  
**Complete Testing Time**: 45-60 minutes  
**Total Time**: ~1 hour

**Happy Testing! 🎉**
