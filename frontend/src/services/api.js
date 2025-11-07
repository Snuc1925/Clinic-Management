import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authService = {
    login: (phone, password) => {
        return api.post('/auth/login', { phone, password });
    },
    register: (userData) => {
        return api.post('/auth/register', userData);
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

export const userService = {
    getAllUsers: () => {
        return api.get('/users');
    },
    getUserById: (id) => {
        return api.get(`/users/${id}`);
    },
    updateUser: (id, userData) => {
        return api.put(`/users/${id}`, userData);
    },
    deleteUser: (id) => {
        return api.delete(`/users/${id}`);
    },
};

export default api;
