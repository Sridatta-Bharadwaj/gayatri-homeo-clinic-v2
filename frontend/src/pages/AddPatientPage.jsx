import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientForm } from '@/components/patients/PatientForm';
import { createPatient } from '@/lib/api';

export function AddPatientPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            const response = await createPatient(formData);
            navigate(`/patients/${response.data.id}`);
        } catch (error) {
            console.error('Error creating patient:', error);
            alert('Failed to create patient. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/patients');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Add New Patient</h1>
                <p className="text-muted-foreground">Register a new patient in the system</p>
            </div>

            <PatientForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
