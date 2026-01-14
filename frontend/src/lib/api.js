import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true  // Enable session cookies
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login on unauthorized (except for auth endpoints)
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/setup')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

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

// Patient Access Control
export const getPatientAccess = (patientId) => api.get(`/patients/${patientId}/access`);

export const sharePatientAccess = (patientId, userIds, comment) =>
    api.post(`/patients/${patientId}/access`, { user_ids: userIds, comment });

export const revokePatientAccess = (patientId, userId) =>
    api.delete(`/patients/${patientId}/access/${userId}`);

// User Management
export const getUsers = () => api.get('/users');

export const getDoctors = () => api.get('/users/doctors');

export const createUser = (data) => api.post('/users', data);

export const updateUser = (id, data) => api.put(`/users/${id}`, data);

export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;
