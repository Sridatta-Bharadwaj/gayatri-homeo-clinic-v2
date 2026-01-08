import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function VisitCard({ visit }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card
            className="p-4 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{formatDate(visit.visit_date)}</h3>
                        {visit.last_edited_at && (
                            <span className="text-xs text-muted-foreground italic">
                                Edited: {formatDateTime(visit.last_edited_at)}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium mb-1">Chief Complaint:</p>
                    <p className="text-sm text-muted-foreground mb-2">{visit.chief_complaint}</p>

                    {!expanded && visit.symptoms && (
                        <p className="text-sm text-muted-foreground">
                            {visit.symptoms.substring(0, 100)}
                            {visit.symptoms.length > 100 && '...'}
                        </p>
                    )}
                </div>
                <div className="ml-4">
                    {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </div>

            {expanded && (
                <div className="mt-4 space-y-3 border-t pt-4">
                    {visit.symptoms && (
                        <div>
                            <p className="text-sm font-medium mb-1">Symptoms:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{visit.symptoms}</p>
                        </div>
                    )}
                    {visit.examination_findings && (
                        <div>
                            <p className="text-sm font-medium mb-1">Examination Findings:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{visit.examination_findings}</p>
                        </div>
                    )}
                    {visit.diagnosis && (
                        <div>
                            <p className="text-sm font-medium mb-1">Diagnosis:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{visit.diagnosis}</p>
                        </div>
                    )}
                    {visit.prescription && (
                        <div>
                            <p className="text-sm font-medium mb-1">Prescription:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{visit.prescription}</p>
                        </div>
                    )}
                    {visit.follow_up_date && (
                        <div>
                            <p className="text-sm font-medium mb-1">Follow-up Date:</p>
                            <p className="text-sm text-muted-foreground">{formatDate(visit.follow_up_date)}</p>
                        </div>
                    )}
                    {visit.doctor_notes && (
                        <div>
                            <p className="text-sm font-medium mb-1">Doctor's Notes:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{visit.doctor_notes}</p>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
