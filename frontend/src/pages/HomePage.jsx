import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboard } from '@/lib/api';
import { Users, TrendingUp, BarChart3 } from 'lucide-react';

export function HomePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await getDashboard();
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to Gayatri Homeo Clinic Management System</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                {/* Total Patients Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.total_patients || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered patients</p>
                    </CardContent>
                </Card>

                {/* Top Complaints Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">Top Complaints (Last 30 Days)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data?.top_complaints && data.top_complaints.length > 0 ? (
                            <div className="space-y-2">
                                {data.top_complaints.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm">{item.complaint}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-12 text-right">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No complaints recorded in the last 30 days</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Age Distribution Card */}
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Age Distribution</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {data?.age_distribution && (
                        <div className="space-y-3">
                            {Object.entries(data.age_distribution).map(([ageGroup, count]) => (
                                <div key={ageGroup} className="flex items-center gap-4">
                                    <span className="text-sm w-16">{ageGroup}</span>
                                    <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                                        <div
                                            className="h-full bg-primary flex items-center justify-end pr-2 text-xs text-primary-foreground font-medium"
                                            style={{
                                                width: `${data.total_patients > 0 ? (count / data.total_patients) * 100 : 0}%`,
                                                minWidth: count > 0 ? '2rem' : '0'
                                            }}
                                        >
                                            {count > 0 && count}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Link to="/patients">
                    <Button size="lg">
                        View All Patients
                    </Button>
                </Link>
            </div>
        </div>
    );
}
