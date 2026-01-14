import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, Users } from 'lucide-react';

export function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                            GH
                        </div>
                        <h1 className="text-xl font-semibold">Gayatri Homoeo Clinic</h1>
                    </Link>

                    {/* Navigation - only show when logged in */}
                    {user && (
                        <nav className="hidden md:flex items-center gap-4">
                            <Link to="/" className="text-sm hover:text-primary transition-colors">
                                Dashboard
                            </Link>
                            <Link to="/patients" className="text-sm hover:text-primary transition-colors">
                                Patients
                            </Link>
                            <Link to="/settings" className="text-sm hover:text-primary transition-colors">
                                Settings
                            </Link>
                            {isAdmin && (
                                <Link to="/users" className="text-sm hover:text-primary transition-colors flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    Users
                                </Link>
                            )}
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <span className="text-sm text-muted-foreground hidden sm:inline">
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
