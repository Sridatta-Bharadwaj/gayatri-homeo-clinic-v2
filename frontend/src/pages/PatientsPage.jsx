import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PatientCard } from '@/components/patients/PatientCard';
import { getPatients } from '@/lib/api';
import { Plus, Search } from 'lucide-react';

export function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        fetchPatients();
    }, [search, sortBy, order]);

    const fetchPatients = async () => {
        try {
            const response = await getPatients(search, sortBy, order);
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Patients</h1>
                    <p className="text-muted-foreground">Manage patient records</p>
                </div>
                <Link to="/patients/new">
                    <Button size="lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Patient
                    </Button>
                </Link>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name, ID, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name">Sort by Name</option>
                        <option value="id">Sort by ID</option>
                        <option value="created_at">Sort by Created</option>
                    </Select>
                    <Select value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </Select>
                </div>
            </div>

            {/* Patient List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Loading patients...</p>
                </div>
            ) : patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-lg font-medium mb-2">No patients yet</p>
                    <p className="text-muted-foreground mb-4">Add your first patient to get started</p>
                    <Link to="/patients/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Patient
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {patients.map((patient) => (
                        <PatientCard key={patient.id} patient={patient} />
                    ))}
                </div>
            )}
        </div>
    );
}
