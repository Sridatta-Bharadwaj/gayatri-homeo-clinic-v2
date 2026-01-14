import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getDoctors, sharePatientAccess } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SharePatientDialog({ open, onOpenChange, patientId, onSuccess }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            fetchDoctors();
            setSelectedDoctors([]);
            setComment('');
            setError('');
        }
    }, [open]);

    const fetchDoctors = async () => {
        try {
            const response = await getDoctors();
            setDoctors(response.data);
        } catch (err) {
            setError('Failed to load doctors list');
        }
    };

    const toggleDoctor = (doctorId) => {
        setSelectedDoctors(prev =>
            prev.includes(doctorId)
                ? prev.filter(id => id !== doctorId)
                : [...prev, doctorId]
        );
    };

    const handleShare = async () => {
        if (selectedDoctors.length === 0) {
            setError('Please select at least one doctor');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await sharePatientAccess(patientId, selectedDoctors, comment);
            onSuccess?.();
            onOpenChange(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to share access');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Patient Access</DialogTitle>
                    <DialogDescription>
                        Grant other doctors access to this patient record
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="comment">Reason / Comment</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="e.g., Second opinion needed, Specialist consultation"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Select Doctors</Label>
                        <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-1">
                            {doctors.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No other doctors available
                                </p>
                            ) : (
                                doctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                                        onClick={() => toggleDoctor(doctor.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDoctors.includes(doctor.id)}
                                            onChange={() => toggleDoctor(doctor.id)}
                                            className="cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{doctor.full_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {doctor.username} • {doctor.role}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleShare} disabled={loading || selectedDoctors.length === 0}>
                        {loading ? 'Sharing...' : `Share with ${selectedDoctors.length} doctor(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
