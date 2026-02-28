import { create } from 'zustand';
import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/services/api.config';

interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    avatar: string;
    coverImage: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: FormData) => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,

    login: async (email: string, password: string) => {
        try {
            set({ isLoading: true });
            const response: any = await apiService.post(API_ENDPOINTS.LOGIN, {
                email,
                password,
            });

            const { accessToken, refreshToken, user } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (formData: FormData) => {
        try {
            set({ isLoading: true });
            console.log('Sending registration request...');
            // Don't set Content-Type manually - axios will set it with the correct boundary
            const response = await apiService.post(API_ENDPOINTS.REGISTER, formData);
            console.log('Registration response:', response);
            set({ isLoading: false });
        } catch (error: any) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response);
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await apiService.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false });
        }
    },

    getCurrentUser: async () => {
        try {
            console.log('Fetching current user...');
            const response: any = await apiService.get(API_ENDPOINTS.CURRENT_USER);
            console.log('Current user response:', response);
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            console.error('Fetch user error:', error);
            set({ user: null, isAuthenticated: false });
        }
    },
}));
