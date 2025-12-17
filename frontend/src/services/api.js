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

export const clinicService = {
    createClinic: (name) => {
        return api.post('/clinics', { name });
    },
    getUserClinics: () => {
        return api.get('/clinics');
    },
    getClinicById: (id) => {
        return api.get(`/clinics/${id}`);
    },
    joinClinic: (code) => {
        return api.post(`/clinics/${code}/join`);
    },
    updateClinic: (id, name) => {
        return api.put(`/clinics/${id}`, { name });
    },
    getClinicMembers: (id) => {
        return api.get(`/clinics/${id}/members`);
    },
    updateMemberStatus: (clinicId, memberId, status) => {
        return api.put(`/clinics/${clinicId}/members/${memberId}/status`, { status });
    },
    updateMemberSalary: (clinicId, memberId, salary) => {
        return api.put(`/clinics/${clinicId}/members/${memberId}/salary`, { salary });
    },
    removeMember: (clinicId, memberId) => {
        return api.delete(`/clinics/${clinicId}/members/${memberId}`);
    },
};

export const patientService = {
    createPatient: (clinicId, patientData) => {
        return api.post(`/clinics/${clinicId}/patients`, patientData);
    },
    getClinicPatients: (clinicId) => {
        return api.get(`/clinics/${clinicId}/patients`);
    },
    getPatient: (clinicId, patientId) => {
        return api.get(`/clinics/${clinicId}/patients/${patientId}`);
    },
    updatePatient: (clinicId, patientId, patientData) => {
        return api.put(`/clinics/${clinicId}/patients/${patientId}`, patientData);
    },
    deletePatient: (clinicId, patientId) => {
        return api.delete(`/clinics/${clinicId}/patients/${patientId}`);
    },
};

export const treatmentService = {
    createTreatment: (clinicId, treatmentData) => {
        return api.post(`/clinics/${clinicId}/treatments`, treatmentData);
    },
    getClinicTreatments: (clinicId) => {
        return api.get(`/clinics/${clinicId}/treatments`);
    },
    getTreatment: (clinicId, treatmentId) => {
        return api.get(`/clinics/${clinicId}/treatments/${treatmentId}`);
    },
};

export const paymentService = {
    addPayment: (treatmentId, paymentData) => {
        return api.post(`/treatments/${treatmentId}/payments`, paymentData);
    },
    getTreatmentPayments: (treatmentId) => {
        return api.get(`/treatments/${treatmentId}/payments`);
    },
};

export const appointmentService = {
    createAppointment: (clinicId, appointmentData) => {
        return api.post(`/clinics/${clinicId}/appointments`, appointmentData);
    },
    getClinicAppointments: (clinicId) => {
        return api.get(`/clinics/${clinicId}/appointments`);
    },
    getCalendarData: (clinicId, start, end) => {
        return api.get(`/clinics/${clinicId}/calendar`, { params: { start, end } });
    },
    updateAppointmentStatus: (appointmentId, status) => {
        return api.put(`/appointments/${appointmentId}`, { status });
    },
};

export const inventoryService = {
    // Item management
    createItem: (clinicId, itemData) => {
        return api.post(`/clinics/${clinicId}/items`, itemData);
    },
    getClinicItems: (clinicId) => {
        return api.get(`/clinics/${clinicId}/items`);
    },
    getItem: (clinicId, itemId) => {
        return api.get(`/clinics/${clinicId}/items/${itemId}`);
    },
    updateItem: (clinicId, itemId, itemData) => {
        return api.put(`/clinics/${clinicId}/items/${itemId}`, itemData);
    },
    deleteItem: (clinicId, itemId) => {
        return api.delete(`/clinics/${clinicId}/items/${itemId}`);
    },
    getLowStockItems: (clinicId) => {
        return api.get(`/clinics/${clinicId}/items/low-stock`);
    },
    
    // Batch management
    importBatches: (clinicId, batchesData) => {
        return api.post(`/clinics/${clinicId}/batches/import`, batchesData);
    },
    getItemBatches: (clinicId, itemId) => {
        return api.get(`/clinics/${clinicId}/items/${itemId}/batches`);
    },
    getExpiringBatches: (clinicId, daysAhead = 30) => {
        return api.get(`/clinics/${clinicId}/batches/expiring`, { params: { daysAhead } });
    },
    exportInventory: (clinicId, exportData) => {
        return api.post(`/clinics/${clinicId}/batches/export`, exportData);
    },
    
    // Transaction history
    getClinicTransactions: (clinicId) => {
        return api.get(`/clinics/${clinicId}/inventory/transactions`);
    },
    getTreatmentTransactions: (treatmentId) => {
        return api.get(`/treatments/${treatmentId}/inventory/transactions`);
    },
};

export const labService = {
    // Lab partner management
    createLabPartner: (clinicId, labPartnerData) => {
        return api.post(`/clinics/${clinicId}/lab-partners`, labPartnerData);
    },
    getClinicLabPartners: (clinicId) => {
        return api.get(`/clinics/${clinicId}/lab-partners`);
    },
    getLabPartner: (clinicId, labPartnerId) => {
        return api.get(`/clinics/${clinicId}/lab-partners/${labPartnerId}`);
    },
    updateLabPartner: (clinicId, labPartnerId, labPartnerData) => {
        return api.put(`/clinics/${clinicId}/lab-partners/${labPartnerId}`, labPartnerData);
    },
    deleteLabPartner: (clinicId, labPartnerId) => {
        return api.delete(`/clinics/${clinicId}/lab-partners/${labPartnerId}`);
    },
    
    // Lab order management
    createLabOrder: (clinicId, labOrderData) => {
        return api.post(`/clinics/${clinicId}/lab-orders`, labOrderData);
    },
    getClinicLabOrders: (clinicId) => {
        return api.get(`/clinics/${clinicId}/lab-orders`);
    },
    getLabOrder: (labOrderId) => {
        return api.get(`/lab-orders/${labOrderId}`);
    },
    getTreatmentLabOrders: (treatmentId) => {
        return api.get(`/treatments/${treatmentId}/lab-orders`);
    },
    updateLabOrderStatus: (labOrderId, statusData) => {
        return api.put(`/lab-orders/${labOrderId}/status`, statusData);
    },
    updateLabOrder: (clinicId, labOrderId, labOrderData) => {
        return api.put(`/clinics/${clinicId}/lab-orders/${labOrderId}`, labOrderData);
    },
    deleteLabOrder: (clinicId, labOrderId) => {
        return api.delete(`/clinics/${clinicId}/lab-orders/${labOrderId}`);
    },
};

export default api;
