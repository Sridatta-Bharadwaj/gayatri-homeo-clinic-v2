import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VisitForm } from '@/components/visits/VisitForm';
import { createVisit, generatePrescription } from '@/lib/api';

export function AddVisitPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData, printAfter) => {
        setIsSubmitting(true);
        try {
            const response = await createVisit(id, formData);

            if (printAfter && response.data.id) {
                // Generate and download prescription
                try {
                    const pdfResponse = await generatePrescription(response.data.id);
                    const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `prescription_${response.data.id}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (pdfError) {
                    console.error('Error generating prescription:', pdfError);
                }
            }

            navigate(`/patients/${id}`);
        } catch (error) {
            console.error('Error creating visit:', error);
            alert('Failed to create visit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(`/patients/${id}`);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Add New Visit</h1>
                <p className="text-muted-foreground">Record a new patient visit</p>
            </div>

            <VisitForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                showPrintButton={true}
            />
        </div>
    );
}
