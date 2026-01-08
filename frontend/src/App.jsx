import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
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
import { useThemeStore } from './store/themeStore';

function App() {
    const { theme, setTheme } = useThemeStore();

    useEffect(() => {
        // Apply theme on mount
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-background">
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/patients" element={<PatientsPage />} />
                    <Route path="/patients/new" element={<AddPatientPage />} />
                    <Route path="/patients/:id" element={<PatientDetailPage />} />
                    <Route path="/patients/:id/edit" element={<EditPatientPage />} />
                    <Route path="/patients/:id/visits" element={<AllVisitsPage />} />
                    <Route path="/patients/:id/visits/new" element={<AddVisitPage />} />
                    <Route path="/visits/:id/edit" element={<EditVisitPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
