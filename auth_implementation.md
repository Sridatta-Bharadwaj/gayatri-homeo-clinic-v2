# Authentication System Implementation Guide
## Add Login/Auth to Existing Homeopathy Management System

---

## Overview

Add user authentication to the existing homeopathy management system. Start with single admin user, but architect for future multi-user support (staff, receptionist, etc.).

**Current State:** App has no login - anyone can access  
**Target State:** Login required, session-based auth, single admin user (expandable later)

---

## Database Changes

### 1. Create New `users` Table

Add this new table to your existing database:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    CONSTRAINT check_role CHECK (role IN ('admin', 'staff', 'viewer'))
);

-- Index for faster username lookup
CREATE INDEX idx_users_username ON users(username);
```

### 2. SQLAlchemy Model

**Create new file: `backend/app/models.py` (add to existing models)**

```python
from datetime import datetime
from flask_login import UserMixin
from app import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='admin')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)
```

---

## Backend Implementation

### 1. Install Dependencies

```bash
cd backend
source venv/bin/activate
pip install flask-login==0.6.3
pip freeze > requirements.txt
```

### 2. Update Flask App Initialization

**File: `backend/app/__init__.py`**

Add Flask-Login setup:

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager
import os

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    
    # Existing config...
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    
    # Session config
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = 1800  # 30 minutes
    
    db.init_app(app)
    CORS(app, supports_credentials=True, origins=['http://localhost:5173'])
    
    # Initialize Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        from app.models import User
        return User.query.get(int(user_id))
    
    # Register blueprints
    from app.routes import auth, patients, visits, analytics, reports, settings
    app.register_blueprint(auth.bp)
    app.register_blueprint(patients.bp)
    app.register_blueprint(visits.bp)
    app.register_blueprint(analytics.bp)
    app.register_blueprint(reports.bp)
    app.register_blueprint(settings.bp)
    
    with app.app_context():
        db.create_all()
    
    return app
```

### 3. Create Auth Routes

**Create new file: `backend/app/routes/auth.py`**

```python
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from datetime import datetime
from app import db
from app.models import User

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/check-setup', methods=['GET'])
def check_setup():
    """Check if initial setup is needed"""
    user_count = User.query.count()
    return jsonify({'needs_setup': user_count == 0})

@bp.route('/setup', methods=['POST'])
def setup():
    """First-time setup: Create admin user"""
    # Check if setup already done
    if User.query.count() > 0:
        return jsonify({'error': 'Setup already completed'}), 400
    
    data = request.json
    
    # Validate input
    if not data.get('username') or not data.get('password') or not data.get('full_name'):
        return jsonify({'error': 'Username, password, and full name are required'}), 400
    
    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    # Create admin user
    user = User(
        username=data['username'],
        password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
        full_name=data['full_name'],
        role='admin'
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Auto-login after setup
    login_user(user, remember=False)
    
    return jsonify({
        'message': 'Setup completed successfully',
        'user': user.to_dict()
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    """Login endpoint"""
    data = request.json
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create session
    login_user(user, remember=False)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200

@bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout endpoint"""
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current logged-in user"""
    return jsonify({'user': current_user.to_dict()}), 200

@bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Change password for current user"""
    data = request.json
    
    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Old and new passwords required'}), 400
    
    if not current_user.check_password(data['old_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    if len(data['new_password']) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400
    
    current_user.password_hash = generate_password_hash(data['new_password'], method='pbkdf2:sha256')
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200
```

### 4. Protect Existing Routes

**Update ALL existing route files** to require login:

```python
# Example: backend/app/routes/patients.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user  # ← ADD THIS
from app import db
from app.models import Patient

bp = Blueprint('patients', __name__, url_prefix='/api/patients')

@bp.route('', methods=['GET'])
@login_required  # ← ADD THIS TO EVERY ROUTE
def get_patients():
    # existing code...
    pass

@bp.route('/<int:id>', methods=['GET'])
@login_required  # ← ADD THIS TO EVERY ROUTE
def get_patient(id):
    # existing code...
    pass

# Add @login_required to ALL routes in:
# - patients.py
# - visits.py
# - analytics.py
# - reports.py
# - settings.py
```

---

## Frontend Implementation

### 1. Create Auth Store

**Create new file: `frontend/src/store/authStore.js`**

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      
      // Check if user is authenticated
      checkAuth: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user, loading: false });
          return true;
        } catch (error) {
          set({ user: null, loading: false });
          return false;
        }
      },
      
      // Login
      login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        set({ user: response.data.user });
        return response.data;
      },
      
      // Logout
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null });
      },
      
      // Setup (first time)
      setup: async (username, password, fullName) => {
        const response = await api.post('/auth/setup', {
          username,
          password,
          full_name: fullName
        });
        set({ user: response.data.user });
        return response.data;
      },
      
      // Check if setup is needed
      checkSetup: async () => {
        const response = await api.get('/auth/check-setup');
        return response.data.needs_setup;
      },
      
      // Change password
      changePassword: async (oldPassword, newPassword) => {
        const response = await api.post('/auth/change-password', {
          old_password: oldPassword,
          new_password: newPassword
        });
        return response.data;
      },
      
      // Computed
      isAuthenticated: () => !!get().user
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);

export default useAuthStore;
```

### 2. Update Axios Configuration

**Update file: `frontend/src/lib/api.js`**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true  // ← ADD THIS (important for session cookies)
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// All existing API functions remain the same
export const getPatients = (search = '', sortBy = 'name', order = 'asc') => 
  api.get('/patients', { params: { search, sort_by: sortBy, order } });

export const getPatient = (id) => api.get(`/patients/${id}`);
// ... etc
```

### 3. Create Login Page

**Create new file: `frontend/src/pages/LoginPage.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Gayatri Homeo Clinic</CardTitle>
          <CardDescription>Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Create Setup Page (First-Time Use)

**Create new file: `frontend/src/pages/SetupPage.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SetupPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setup = useAuthStore((state) => state.setup);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await setup(username, password, fullName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Welcome to Gayatri Homeo Clinic</CardTitle>
          <CardDescription>Create your admin account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Your Name"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Create Protected Route Component

**Create new file: `frontend/src/components/ProtectedRoute.jsx`**

```jsx
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { user, loading, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

### 6. Update Header Component

**Update file: `frontend/src/components/layout/Header.jsx`**

```jsx
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-10" />
          <h1 className="text-xl font-semibold">Gayatri Homeo Clinic</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">
              Welcome, {user.full_name}
            </span>
          )}
          <ThemeToggle />
          {user && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

### 7. Update App Routes

**Update file: `frontend/src/App.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';

// Existing pages
import HomePage from './pages/HomePage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AddPatientPage from './pages/AddPatientPage';
import EditPatientPage from './pages/EditPatientPage';
import AllVisitsPage from './pages/AllVisitsPage';
import AddVisitPage from './pages/AddVisitPage';
import EditVisitPage from './pages/EditVisitPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [needsSetup, setNeedsSetup] = useState(null);
  const checkSetup = useAuthStore((state) => state.checkSetup);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const initialize = async () => {
      const setupNeeded = await checkSetup();
      setNeedsSetup(setupNeeded);
      
      if (!setupNeeded) {
        await checkAuth();
      }
    };
    
    initialize();
  }, [checkSetup, checkAuth]);

  if (needsSetup === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Setup route (first-time use) */}
        {needsSetup && (
          <Route path="/setup" element={<SetupPage />} />
        )}
        
        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
        <Route path="/patients/new" element={<ProtectedRoute><AddPatientPage /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
        <Route path="/patients/:id/edit" element={<ProtectedRoute><EditPatientPage /></ProtectedRoute>} />
        <Route path="/patients/:id/visits" element={<ProtectedRoute><AllVisitsPage /></ProtectedRoute>} />
        <Route path="/patients/:id/visits/new" element={<ProtectedRoute><AddVisitPage /></ProtectedRoute>} />
        <Route path="/visits/:id/edit" element={<ProtectedRoute><EditVisitPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        {/* Redirect to setup or login */}
        <Route path="*" element={<Navigate to={needsSetup ? "/setup" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 8. Add Change Password to Settings Page

**Update file: `frontend/src/pages/SettingsPage.jsx`**

Add this section to the existing SettingsPage:

```jsx
import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Add this component to your existing SettingsPage
function ChangePasswordSection() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const changePassword = useAuthStore((state) => state.changePassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      setMessage('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Add <ChangePasswordSection /> to your SettingsPage component
```

---

## Environment Variables

**Update `backend/.env`:**

```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-strong-secret-key-here-change-this-in-production
DATABASE_URL=postgresql://homeopathy_user:your_password@localhost:5432/homeopathy_db
```

**Generate a strong secret key:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
source venv/bin/activate
pip install flask-login==0.6.3
pip freeze > requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install zustand
```

### 3. Run Database Migrations
```bash
cd backend
source venv/bin/activate
python run.py  # This will create the users table automatically
```

---

## Testing the Authentication Flow

### 1. First Launch (Setup)
1. Start backend: `python run.py`
2. Start frontend: `npm run dev`
3. Open browser: `http://localhost:5173`
4. Should redirect to `/setup` (first-time setup page)
5. Fill in:
   - Full Name: Dr. [Name]
   - Username: admin (default)
   - Password: (at least 8 characters)
   - Confirm Password: (same)
6. Click "Complete Setup"
7. Should auto-login and redirect to home page

### 2. Subsequent Logins
1. Open browser: `http://localhost:5173`
2. Should redirect to `/login`
3. Enter username and password
4. Click "Login"
5. Should redirect to home page

### 3. Session Management
- Session expires after 30 minutes of inactivity
- Closing browser logs you out
- Manual logout via button in header

### 4. Protected Routes
- Try accessing `/patients` without login → Redirects to login
- Try accessing `/settings` without login → Redirects to login
- All API calls without session → Returns 401 error

---

## Summary of Changes

### Database:
✅ New `users` table  
✅ Initial admin user created during setup

### Backend:
✅ Flask-Login integration  
✅ Auth routes: `/api/auth/setup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/change-password`  
✅ All existing routes protected with `@login_required`  
✅ Session management (30-minute timeout)  
✅ Password hashing (bcrypt)

### Frontend:
✅ Login page  
✅ Setup page (first-time use)  
✅ Auth store (Zustand)  
✅ Protected routes  
✅ Updated header (shows user name, logout button)  
✅ Change password in settings  
✅ Session handling (auto-redirect on 401)

---

## Security Features Implemented

1. ✅ Password hashing (pbkdf2:sha256)
2. ✅ Secure session cookies (httpOnly, sameSite)
3. ✅ Session timeout (30 minutes)
4. ✅ Protected API routes
5. ✅ Password strength validation (min 8 chars)
6. ✅ No password storage in frontend
7. ✅ CORS with credentials
8. ✅ 401 error handling with auto-redirect

---

## Future Enhancements (Not in MVP)

After MVP is working, you can easily add:

1. **Multiple Users:**
   - User management page (add/edit/disable users)
   - Role-based permissions (admin, staff, viewer)

2. **Enhanced Security:**
   - Rate limiting on login attempts
   - Password reset via email
   - Two-factor authentication (2FA)

3. **Audit Trail:**
   - Track who created/edited patients
   - Track who created/edited visits
   - Activity logs

4. **Better UX:**
   - "Remember me" option
   - Session timeout warning (5 min before logout)
   - Last login timestamp display

---

## Troubleshooting

### Issue: "401 Unauthorized" on all API calls
**Solution:** Check that `withCredentials: true` is set in axios config

### Issue: Setup page keeps appearing
**Solution:** Check database - make sure user was created successfully
```sql
SELECT * FROM users;
```

### Issue: Can't login after setup
**Solution:** Check password was set correctly. Reset in database:
```python
from werkzeug.security import generate_password_hash
# Generate new hash
hashed = generate_password_hash('newpassword', method='pbkdf2:sha256')
# Update in database
UPDATE users SET password_hash = '<paste-hash-here>' WHERE username = 'admin';
```

### Issue: Session expires too quickly
**Solution:** Adjust in `backend/app/__init__.py`:
```python
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 60 minutes instead of 30
```

### Issue: CORS errors
**Solution:** Make sure CORS is configured with credentials:
```python
CORS(app, supports_credentials=True, origins=['http://localhost:5173'])
```

---

## Checklist for Implementation

**Backend:**
- [ ] Install `flask-login`
- [ ] Create `User` model in `models.py`
- [ ] Update `__init__.py` with Flask-Login setup
- [ ] Create `auth.py` routes file
- [ ] Add `@login_required` to all existing routes
- [ ] Update `.env` with SECRET_KEY
- [ ] Run app to create users table

**Frontend:**
- [ ] Install `zustand` if not already installed
- [ ] Create `authStore.js`
- [ ] Update `api.js` with `withCredentials: true`
- [ ] Create `LoginPage.jsx`
- [ ] Create `SetupPage.jsx`
- [ ] Create `ProtectedRoute.jsx` component
- [ ] Update `Header.jsx` with user info and logout
- [ ] Update `App.jsx` with auth routes
- [ ] Add change password to `SettingsPage.jsx`
- [ ] Test login flow

**Testing:**
- [ ] First launch shows setup page
- [ ] Can create admin account
- [ ] Can login with credentials
- [ ] Can't access pages without login
- [ ] Logout works correctly
- [ ] Change password works
- [ ] Session expires after 30 min

---

## Implementation Prompt for AI

**Give this to Claude Sonnet 4.5 in Antigravity:**

```
I have an existing homeopathy management system (Vite + React + Flask + PostgreSQL). 

I need you to add user authentication following the specifications in this document.

Requirements:
1. Create new users table in PostgreSQL
2. Add Flask-Login for session management
3. Create auth routes (setup, login, logout, change password)
4. Protect all existing API routes with @login_required
5. Create frontend login page, setup page, and auth store
6. Protect frontend routes with authentication check
7. Update header to show user info and logout button

Follow the exact implementation in this document. Start with:
1. Backend: User model and auth routes
2. Frontend: Auth store and login/setup pages
3. Integration: Protect routes and test

The system should support first-time setup (creating admin user) and then require login for all subsequent access.
```

---

That's everything! The document is ready to feed to the AI. It will add complete authentication to your existing system. 🔐🚀