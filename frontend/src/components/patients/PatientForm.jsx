import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

export function PatientForm({ initialData = {}, onSubmit, onCancel, isSubmitting = false }) {
    const [formData, setFormData] = useState({
        full_name: initialData.full_name || '',
        date_of_birth: initialData.date_of_birth || '',
        gender: initialData.gender || 'Male',
        contact_number: initialData.contact_number || '',
        email: initialData.email || '',
        address: initialData.address || '',
        occupation: initialData.occupation || '',
        allergies: initialData.allergies || '',
        chronic_conditions: initialData.chronic_conditions || '',
        current_medications: initialData.current_medications || '',
        family_history: initialData.family_history || '',
        emergency_contact_name: initialData.emergency_contact_name || '',
        emergency_contact_number: initialData.emergency_contact_number || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="date_of_birth">Date of Birth *</Label>
                            <Input
                                id="date_of_birth"
                                name="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="gender">Gender *</Label>
                            <Select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="contact_number">Contact Number *</Label>
                            <Input
                                id="contact_number"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input
                                id="occupation"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                            id="allergies"
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            rows={2}
                            placeholder="List any known allergies..."
                        />
                    </div>
                    <div>
                        <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
                        <Textarea
                            id="chronic_conditions"
                            name="chronic_conditions"
                            value={formData.chronic_conditions}
                            onChange={handleChange}
                            rows={2}
                        />
                    </div>
                    <div>
                        <Label htmlFor="current_medications">Current Medications</Label>
                        <Textarea
                            id="current_medications"
                            name="current_medications"
                            value={formData.current_medications}
                            onChange={handleChange}
                            rows={2}
                        />
                    </div>
                    <div>
                        <Label htmlFor="family_history">Family History</Label>
                        <Textarea
                            id="family_history"
                            name="family_history"
                            value={formData.family_history}
                            onChange={handleChange}
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="emergency_contact_name">Contact Name</Label>
                            <Input
                                id="emergency_contact_name"
                                name="emergency_contact_name"
                                value={formData.emergency_contact_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="emergency_contact_number">Contact Number</Label>
                            <Input
                                id="emergency_contact_number"
                                name="emergency_contact_number"
                                value={formData.emergency_contact_number}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4 mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Patient'}
                </Button>
            </div>
        </form>
    );
}
