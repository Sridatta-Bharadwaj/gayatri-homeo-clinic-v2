import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { PatientsPage } from './pages/PatientsPage';
import { AddPatientPage } from './pages/AddPatientPage';
import { EditPatientPage } from './pages/EditPatientPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { AllVisitsPage } from './pages/AllVisitsPage';
import { AddVisitPage } from './pages/AddVisitPage';
import { EditVisitPage } from './pages/EditVisitPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useThemeStore } from './store/themeStore';
import useAuthStore from './store/authStore';

function App() {
    const { theme } = useThemeStore();
    const [needsSetup, setNeedsSetup] = useState(null);
    const checkSetup = useAuthStore((state) => state.checkSetup);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        // Apply theme on mount
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

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

    console.log('App rendering - needsSetup:', needsSetup);

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-background">
                <Header />
                <Routes>
                    {/* Setup route (first-time use) - always available */}
                    <Route path="/setup" element={<SetupPage />} />

                    {/* Login route */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            needsSetup ? (
                                <Navigate to="/setup" replace />
                            ) : (
                                <ProtectedRoute><HomePage /></ProtectedRoute>
                            )
                        }
                    />
                    <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
                    <Route path="/patients/new" element={<ProtectedRoute><AddPatientPage /></ProtectedRoute>} />
                    <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
                    <Route path="/patients/:id/edit" element={<ProtectedRoute><EditPatientPage /></ProtectedRoute>} />
                    <Route path="/patients/:id/visits" element={<ProtectedRoute><AllVisitsPage /></ProtectedRoute>} />
                    <Route path="/patients/:id/visits/new" element={<ProtectedRoute><AddVisitPage /></ProtectedRoute>} />
                    <Route path="/visits/:id/edit" element={<ProtectedRoute><EditVisitPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><AdminRoute><UsersPage /></AdminRoute></ProtectedRoute>} />

                    {/* Redirect root based on setup status */}
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to={needsSetup ? "/setup" : "/login"}
                                replace
                            />
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
