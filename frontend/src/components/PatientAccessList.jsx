import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPatientAccess, revokePatientAccess } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { UserMinus, Calendar } from 'lucide-react';
import useAuthStore from '@/store/authStore';

export default function PatientAccessList({ patientId, isCreator, onAccessRevoked }) {
    const [accessData, setAccessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchAccess();
    }, [patientId]);

    const fetchAccess = async () => {
        try {
            const response = await getPatientAccess(patientId);
            setAccessData(response.data);
        } catch (err) {
            console.error('Failed to fetch access:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (userId) => {
        if (!confirm('Are you sure you want to revoke access for this user?')) {
            return;
        }

        try {
            await revokePatientAccess(patientId, userId);
            fetchAccess();
            onAccessRevoked?.();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to revoke access');
        }
    };

    if (loading) {
        return <p className="text-sm text-muted-foreground">Loading access information...</p>;
    }

    if (!accessData) {
        return <p className="text-sm text-muted-foreground">No access information available</p>;
    }

    const canRevoke = isCreator || isAdmin;

    return (
        <div className="space-y-4">
            {/* Creator */}
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium">{accessData.creator?.full_name || 'Unknown'}</p>
                        <Badge variant="default">Creator</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {accessData.creator?.username}
                    </p>
                </div>
            </div>

            {/* Shared Access */}
            {accessData.shared_with && accessData.shared_with.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Shared With:</h4>
                    {accessData.shared_with.map((access) => (
                        <div key={access.id} className="flex items-start justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{access.user_name}</p>
                                    {access.user_id === user?.id && (
                                        <Badge variant="outline">You</Badge>
                                    )}
                                </div>
                                {access.access_comment && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        "{access.access_comment}"
                                    </p>
                                )}
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>Granted {new Date(access.granted_at).toLocaleDateString()}</span>
                                    <span>by {access.granted_by_name}</span>
                                </div>
                            </div>
                            {canRevoke && access.user_id !== user?.id && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRevoke(access.user_id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <UserMinus className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {accessData.shared_with?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    This patient has not been shared with anyone
                </p>
            )}
        </div>
    );
}
