import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            loading: true,

            // Check if user is authenticated
            checkAuth: async () => {
                try {
                    const response = await api.get('/auth/me');
                    set({ user: response.data.user, loading: false });
                    return true;
                } catch (error) {
                    set({ user: null, loading: false });
                    return false;
                }
            },

            // Login
            login: async (username, password) => {
                const response = await api.post('/auth/login', { username, password });
                set({ user: response.data.user });
                return response.data;
            },

            // Logout
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error:', error);
                }
                set({ user: null });
            },

            // Setup (first time)
            setup: async (username, password, fullName) => {
                const response = await api.post('/auth/setup', {
                    username,
                    password,
                    full_name: fullName
                });
                set({ user: response.data.user });
                return response.data;
            },

            // Check if setup is needed
            checkSetup: async () => {
                try {
                    const response = await api.get('/auth/check-setup');
                    console.log('Setup check response:', response.data);
                    return response.data.needs_setup;
                } catch (error) {
                    console.error('Setup check error:', error);
                    return false;
                }
            },

            // Change password
            changePassword: async (oldPassword, newPassword) => {
                const response = await api.post('/auth/change-password', {
                    old_password: oldPassword,
                    new_password: newPassword
                });
                return response.data;
            },

            // Computed
            isAuthenticated: () => !!get().user
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user })
        }
    )
);

export default useAuthStore;
