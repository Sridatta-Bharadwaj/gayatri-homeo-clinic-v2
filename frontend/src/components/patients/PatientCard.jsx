import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export function PatientCard({ patient }) {
    const navigate = useNavigate();

    return (
        <Card
            className="p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
            onClick={() => navigate(`/patients/${patient.id}`)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{patient.full_name}</h3>
                        <span className="text-sm text-muted-foreground">({patient.patient_id})</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Age: {patient.age} years</span>
                        <span>•</span>
                        <span>{patient.gender}</span>
                        <span>•</span>
                        <span>{patient.contact_number}</span>
                    </div>
                    {patient.latest_visit_date && (
                        <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Last Visit: </span>
                            <span className="font-medium">{formatDate(patient.latest_visit_date)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
