import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getSettings, updateSetting, uploadLetterhead } from '@/lib/api';
import { useThemeStore } from '@/store/themeStore';
import { Moon, Sun, Upload } from 'lucide-react';

export function SettingsPage() {
    const { theme, toggleTheme } = useThemeStore();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await getSettings();
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all(
                Object.entries(settings).map(([key, value]) =>
                    updateSetting(key, value)
                )
            );
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadLetterhead(file);
            alert('Letterhead uploaded successfully!');
            fetchSettings();
        } catch (error) {
            console.error('Error uploading letterhead:', error);
            alert('Failed to upload letterhead');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <p className="text-muted-foreground">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage clinic information and preferences</p>
            </div>

            {/* Clinic Information */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Clinic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="clinic_name">Clinic Name</Label>
                        <Input
                            id="clinic_name"
                            value={settings.clinic_name || ''}
                            onChange={(e) => handleChange('clinic_name', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="clinic_address">Clinic Address</Label>
                        <Textarea
                            id="clinic_address"
                            value={settings.clinic_address || ''}
                            onChange={(e) => handleChange('clinic_address', e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="clinic_contact">Contact Number</Label>
                            <Input
                                id="clinic_contact"
                                value={settings.clinic_contact || ''}
                                onChange={(e) => handleChange('clinic_contact', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="clinic_email">Email</Label>
                            <Input
                                id="clinic_email"
                                type="email"
                                value={settings.clinic_email || ''}
                                onChange={(e) => handleChange('clinic_email', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="doctor_registration_number">Registration Number</Label>
                            <Input
                                id="doctor_registration_number"
                                value={settings.doctor_registration_number || ''}
                                onChange={(e) => handleChange('doctor_registration_number', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="doctor_qualifications">Doctor Qualifications</Label>
                            <Input
                                id="doctor_qualifications"
                                value={settings.doctor_qualifications || ''}
                                onChange={(e) => handleChange('doctor_qualifications', e.target.value)}
                            />
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Clinic Information'}
                    </Button>
                </CardContent>
            </Card>

            {/* Letterhead */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Letterhead for Certificates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.letterhead_path && (
                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">Current Letterhead:</p>
                            <div className="border rounded-md p-4 bg-muted/50">
                                <p className="text-sm">Letterhead uploaded ✓</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="letterhead">Upload New Letterhead (PNG/JPG)</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input
                                id="letterhead"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleFileUpload}
                            />
                            <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            This will be used in medical certificates
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Theme */}
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Theme</Label>
                            <p className="text-sm text-muted-foreground">
                                Switch between light and dark mode
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={toggleTheme}
                        >
                            {theme === 'light' ? (
                                <>
                                    <Moon className="mr-2 h-4 w-4" />
                                    Dark Mode
                                </>
                            ) : (
                                <>
                                    <Sun className="mr-2 h-4 w-4" />
                                    Light Mode
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
