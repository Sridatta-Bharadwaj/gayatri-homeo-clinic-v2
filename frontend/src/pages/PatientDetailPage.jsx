import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPatient, generatePatientReport, generatePrescription, deletePatient } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, Edit, FileText, Plus, AlertTriangle, Trash2, Share2 } from 'lucide-react';
import SharePatientDialog from '@/components/SharePatientDialog';
import PatientAccessList from '@/components/PatientAccessList';
import useAuthStore from '@/store/authStore';

export function PatientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const user = useAuthStore((state) => state.user);

    const isCreator = data?.patient?.created_by === user?.id;
    const isAdmin = user?.role === 'admin';
    const canShare = isCreator || isAdmin;

    useEffect(() => {
        fetchPatientData();
    }, [id]);

    const fetchPatientData = async () => {
        try {
            const response = await getPatient(id);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching patient:', error);
            alert('Failed to load patient data');
            navigate('/patients');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        try {
            const response = await generatePatientReport(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `patient_report_${data.patient.patient_id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this patient? This will also delete all visit records.')) {
            try {
                await deletePatient(id);
                navigate('/patients');
            } catch (error) {
                console.error('Error deleting patient:', error);
                alert('Failed to delete patient');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-muted-foreground">Loading patient data...</p>
            </div>
        );
    }

    const { patient, latest_visit } = data;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{patient.full_name}</h1>
                    <p className="text-muted-foreground">Patient ID: {patient.patient_id}</p>
                </div>
                <Link to={`/patients/${id}/edit`}>
                    <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            {/* Patient Info Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Age</p>
                            <p className="font-medium">{patient.age} years</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium">{patient.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Date of Birth</p>
                            <p className="font-medium">{formatDate(patient.date_of_birth)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Contact</p>
                            <p className="font-medium">{patient.contact_number}</p>
                        </div>
                        {patient.email && (
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{patient.email}</p>
                            </div>
                        )}
                        {patient.occupation && (
                            <div>
                                <p className="text-sm text-muted-foreground">Occupation</p>
                                <p className="font-medium">{patient.occupation}</p>
                            </div>
                        )}
                    </div>

                    {patient.address && (
                        <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium">{patient.address}</p>
                        </div>
                    )}

                    {patient.allergies && (
                        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded-md">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold">Allergies</p>
                                    <p>{patient.allergies}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(patient.chronic_conditions || patient.current_medications || patient.family_history) && (
                        <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                            {patient.chronic_conditions && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Chronic Conditions</p>
                                    <p className="font-medium">{patient.chronic_conditions}</p>
                                </div>
                            )}
                            {patient.current_medications && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Medications</p>
                                    <p className="font-medium">{patient.current_medications}</p>
                                </div>
                            )}
                            {patient.family_history && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Family History</p>
                                    <p className="font-medium">{patient.family_history}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {(patient.emergency_contact_name || patient.emergency_contact_number) && (
                        <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                            {patient.emergency_contact_name && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Emergency Contact</p>
                                    <p className="font-medium">{patient.emergency_contact_name}</p>
                                </div>
                            )}
                            {patient.emergency_contact_number && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Emergency Number</p>
                                    <p className="font-medium">{patient.emergency_contact_number}</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Latest Visit Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Latest Visit</CardTitle>
                </CardHeader>
                <CardContent>
                    {latest_visit ? (
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Visit Date</p>
                                <p className="font-medium">{formatDate(latest_visit.visit_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Chief Complaint</p>
                                <p className="font-medium">{latest_visit.chief_complaint}</p>
                            </div>
                            {latest_visit.diagnosis && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Diagnosis</p>
                                    <p className="font-medium">{latest_visit.diagnosis}</p>
                                </div>
                            )}
                            {latest_visit.last_edited_at && (
                                <p className="text-sm text-muted-foreground italic">
                                    Last edited: {formatDateTime(latest_visit.last_edited_at)}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No visits yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Access Management Card */}
            {(canShare || isAdmin) && (
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Access Management</CardTitle>
                            {canShare && (
                                <Button onClick={() => setShowShareDialog(true)} size="sm">
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share Access
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <PatientAccessList
                            patientId={id}
                            isCreator={isCreator}
                            onAccessRevoked={fetchPatientData}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Share Patient Dialog */}
            <SharePatientDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                patientId={id}
                onSuccess={fetchPatientData}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <Link to="/patients">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </Button>
                </Link>
                <Link to={`/patients/${id}/visits`}>
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        View All Visits
                    </Button>
                </Link>
                <Link to={`/patients/${id}/visits/new`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Visit
                    </Button>
                </Link>
                <Button variant="outline" onClick={handleGenerateReport}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Patient
                </Button>
            </div>
        </div>
    );
}
