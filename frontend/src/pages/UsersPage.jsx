import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUsers, deleteUser } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import AddUserDialog from '../components/AddUserDialog';
import useAuthStore from '@/store/authStore';

export function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user) => {
        if (user.id === currentUser.id) {
            alert('You cannot delete your own account');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${user.full_name}?`)) {
            return;
        }

        try {
            await deleteUser(user.id);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowAddDialog(true);
    };

    const handleDialogClose = () => {
        setShowAddDialog(false);
        setEditingUser(null);
    };

    const handleSuccess = () => {
        fetchUsers();
        handleDialogClose();
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage system users and permissions</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Name</th>
                                    <th className="text-left p-3">Username</th>
                                    <th className="text-left p-3">Role</th>
                                    <th className="text-left p-3">Status</th>
                                    <th className="text-left p-3">Created</th>
                                    <th className="text-right p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-accent">
                                        <td className="p-3">
                                            <div>
                                                <p className="font-medium">{user.full_name}</p>
                                                {user.id === currentUser.id && (
                                                    <Badge variant="outline" className="text-xs mt-1">You</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 text-muted-foreground">{user.username}</td>
                                        <td className="p-3">
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(user)}
                                                    disabled={user.id === currentUser.id}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <AddUserDialog
                open={showAddDialog}
                onOpenChange={handleDialogClose}
                user={editingUser}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
