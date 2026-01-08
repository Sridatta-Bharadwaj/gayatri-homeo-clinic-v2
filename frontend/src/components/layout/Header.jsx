import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-10 w-10" />
                    <h1 className="text-xl font-semibold">Gayatri Homeo Clinic</h1>
                </Link>
                <ThemeToggle />
            </div>
        </header>
    );
}
