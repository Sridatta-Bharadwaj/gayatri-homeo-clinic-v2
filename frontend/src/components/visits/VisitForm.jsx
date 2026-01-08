import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VisitForm({ initialData = {}, onSubmit, onCancel, isSubmitting = false, showPrintButton = false }) {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        visit_date: initialData.visit_date || today,
        chief_complaint: initialData.chief_complaint || '',
        symptoms: initialData.symptoms || '',
        examination_findings: initialData.examination_findings || '',
        diagnosis: initialData.diagnosis || '',
        prescription: initialData.prescription || '',
        follow_up_date: initialData.follow_up_date || '',
        doctor_notes: initialData.doctor_notes || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e, printAfter = false) => {
        e.preventDefault();
        onSubmit(formData, printAfter);
    };

    return (
        <form onSubmit={(e) => handleSubmit(e, false)}>
            <Card>
                <CardHeader>
                    <CardTitle>Visit Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="visit_date">Visit Date *</Label>
                        <Input
                            id="visit_date"
                            name="visit_date"
                            type="date"
                            value={formData.visit_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="chief_complaint">Chief Complaint *</Label>
                        <Textarea
                            id="chief_complaint"
                            name="chief_complaint"
                            value={formData.chief_complaint}
                            onChange={handleChange}
                            rows={3}
                            required
                            placeholder="Main reason for visit..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="symptoms">Symptoms</Label>
                        <Textarea
                            id="symptoms"
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Detailed symptoms description..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="examination_findings">Examination Findings</Label>
                        <Textarea
                            id="examination_findings"
                            name="examination_findings"
                            value={formData.examination_findings}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Physical examination findings..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Textarea
                            id="diagnosis"
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Clinical diagnosis..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="prescription">Prescription</Label>
                        <Textarea
                            id="prescription"
                            name="prescription"
                            value={formData.prescription}
                            onChange={handleChange}
                            rows={6}
                            placeholder="Medications and dosage instructions..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="follow_up_date">Follow-up Date</Label>
                        <Input
                            id="follow_up_date"
                            name="follow_up_date"
                            type="date"
                            value={formData.follow_up_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label htmlFor="doctor_notes">Doctor's Notes</Label>
                        <Textarea
                            id="doctor_notes"
                            name="doctor_notes"
                            value={formData.doctor_notes}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Additional notes for internal use..."
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4 mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Visit'}
                </Button>
                {showPrintButton && (
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={isSubmitting}
                        onClick={(e) => handleSubmit(e, true)}
                    >
                        Save & Print Prescription
                    </Button>
                )}
            </div>
        </form>
    );
}
