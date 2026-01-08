import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VisitCard } from '@/components/visits/VisitCard';
import { getPatient, getPatientVisits } from '@/lib/api';
import { ArrowLeft, Plus } from 'lucide-react';

export function AllVisitsPage() {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [patientRes, visitsRes] = await Promise.all([
                getPatient(id),
                getPatientVisits(id)
            ]);
            setPatient(patientRes.data.patient);
            setVisits(visitsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-muted-foreground">Loading visits...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Link to={`/patients/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{patient?.full_name}</h1>
                    <p className="text-muted-foreground">Patient ID: {patient?.patient_id}</p>
                </div>
                <Link to={`/patients/${id}/visits/new`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Visit
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold">Visit History</h2>
                <p className="text-muted-foreground">Total visits: {visits.length}</p>
            </div>

            {visits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-lg font-medium mb-2">No visits yet</p>
                    <p className="text-muted-foreground mb-4">Add the first visit for this patient</p>
                    <Link to={`/patients/${id}/visits/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Visit
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {visits.map((visit) => (
                        <VisitCard key={visit.id} visit={visit} />
                    ))}
                </div>
            )}
        </div>
    );
}
