import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VisitForm } from '@/components/visits/VisitForm';
import { getVisit, updateVisit } from '@/lib/api';

export function EditVisitPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [visit, setVisit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchVisit();
    }, [id]);

    const fetchVisit = async () => {
        try {
            const response = await getVisit(id);
            setVisit(response.data);
        } catch (error) {
            console.error('Error fetching visit:', error);
            alert('Failed to load visit data');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await updateVisit(id, formData);
            navigate(-1);
        } catch (error) {
            console.error('Error updating visit:', error);
            alert('Failed to update visit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-muted-foreground">Loading visit data...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Edit Visit</h1>
                <p className="text-muted-foreground">Update visit information</p>
            </div>

            <VisitForm
                initialData={visit}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                showPrintButton={false}
            />
        </div>
    );
}
