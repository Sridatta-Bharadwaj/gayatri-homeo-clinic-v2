import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PatientForm } from '@/components/patients/PatientForm';
import { getPatient, updatePatient } from '@/lib/api';

export function EditPatientPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPatient();
    }, [id]);

    const fetchPatient = async () => {
        try {
            const response = await getPatient(id);
            setPatient(response.data.patient);
        } catch (error) {
            console.error('Error fetching patient:', error);
            alert('Failed to load patient data');
            navigate('/patients');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await updatePatient(id, formData);
            navigate(`/patients/${id}`);
        } catch (error) {
            console.error('Error updating patient:', error);
            alert('Failed to update patient. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(`/patients/${id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-muted-foreground">Loading patient data...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Edit Patient</h1>
                <p className="text-muted-foreground">Update patient information</p>
            </div>

            <PatientForm
                initialData={patient}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
