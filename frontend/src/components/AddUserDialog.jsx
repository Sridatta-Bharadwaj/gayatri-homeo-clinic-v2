import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createUser, updateUser } from '@/lib/api';

export default function AddUserDialog({ open, onOpenChange, user, onSuccess }) {
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        password: '',
        role: 'doctor',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name,
                username: user.username,
                password: '',
                role: user.role,
                is_active: user.is_active
            });
        } else {
            setFormData({
                full_name: '',
                username: '',
                password: '',
                role: 'doctor',
                is_active: true
            });
        }
        setError('');
    }, [user, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.full_name || !formData.username) {
            setError('Full name and username are required');
            return;
        }

        if (!user && !formData.password) {
            setError('Password is required for new users');
            return;
        }

        if (formData.password && formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData
            };

            // Don't send password if it's empty (for updates)
            if (user && !formData.password) {
                delete payload.password;
            }

            if (user) {
                await updateUser(user.id, payload);
            } else {
                await createUser(payload);
            }

            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${user ? 'update' : 'create'} user`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'Update user information' : 'Create a new user account'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Dr. John Doe"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="johndoe"
                            required
                            disabled={loading || !!user}
                        />
                        {user && (
                            <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password{user && ' (leave blank to keep current)'}</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={user ? '••••••••' : 'At least 8 characters'}
                            required={!user}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={loading}
                        >
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            disabled={loading}
                            className="cursor-pointer"
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
