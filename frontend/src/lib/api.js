import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' }
});

// Patients
export const getPatients = (search = '', sortBy = 'name', order = 'asc') =>
    api.get('/patients', { params: { search, sort_by: sortBy, order } });

export const getPatient = (id) => api.get(`/patients/${id}`);

export const createPatient = (data) => api.post('/patients', data);

export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);

export const deletePatient = (id) => api.delete(`/patients/${id}`);

// Visits
export const getPatientVisits = (patientId) => api.get(`/patients/${patientId}/visits`);

export const getVisit = (id) => api.get(`/visits/${id}`);

export const createVisit = (patientId, data) => api.post(`/patients/${patientId}/visits`, data);

export const updateVisit = (id, data) => api.put(`/visits/${id}`, data);

// Analytics
export const getDashboard = () => api.get('/analytics/dashboard');

// Reports
export const generatePatientReport = (patientId) =>
    api.post(`/reports/patient/${patientId}`, {}, { responseType: 'blob' });

export const generateCertificate = (data) =>
    api.post('/reports/certificate', data, { responseType: 'blob' });

export const generatePrescription = (visitId) =>
    api.post(`/reports/prescription/${visitId}`, {}, { responseType: 'blob' });

// Settings
export const getSettings = () => api.get('/settings');

export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value });

export const uploadLetterhead = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/settings/letterhead', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export default api;
