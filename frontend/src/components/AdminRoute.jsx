import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function AdminRoute({ children }) {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-destructive mb-4">Access Denied</h1>
                    <p className="text-muted-foreground mb-4">You need administrator privileges to access this page.</p>
                    <a href="/" className="text-primary hover:underline">Return to Home</a>
                </div>
            </div>
        );
    }

    return children;
}
