import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ClinicList from './pages/clinic/ClinicList';
import CreateClinic from './pages/clinic/CreateClinic';
import JoinClinic from './pages/clinic/JoinClinic';
import ClinicManagement from './pages/clinic/ClinicManagement';
import PatientList from './pages/patient/PatientList';
import PatientForm from './pages/patient/PatientForm';
import PatientDetail from './pages/patient/PatientDetail';
import TreatmentList from './pages/treatment/TreatmentList';
import TreatmentForm from './pages/treatment/TreatmentForm';
import TreatmentDetail from './pages/treatment/TreatmentDetail';
import AppointmentList from './pages/appointment/AppointmentList';
import AppointmentForm from './pages/appointment/AppointmentForm';
import AppointmentDetail from './pages/appointment/AppointmentDetail';
import CalendarView from './pages/appointment/CalendarView';
import Reports from './pages/reports/Reports';
import SupplierList from './pages/inventory/SupplierList';
import ItemList from './pages/inventory/ItemList';
import ItemForm from './pages/inventory/ItemForm';
import ItemBatchList from './pages/inventory/ItemBatchList';
import TransactionHistory from './pages/inventory/TransactionHistory';
import LabPartnerList from './pages/lab/LabPartnerList';
import LabOrderList from './pages/lab/LabOrderList';
import LabManagement from './pages/lab/LabManagement';
import LabOrderForm from './pages/lab/LabOrderForm';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clinics" element={<ClinicList />} />
            <Route path="/clinics/create" element={<CreateClinic />} />
            <Route path="/clinics/join" element={<JoinClinic />} />
            <Route path="/clinics/:id/manage" element={<ClinicManagement />} />
            <Route path="/clinics/:clinicId/patients" element={<PatientList />} />
            <Route path="/clinics/:clinicId/patients/new" element={<PatientForm />} />
            <Route path="/clinics/:clinicId/patients/:patientId" element={<PatientDetail />} />
            <Route path="/clinics/:clinicId/patients/:patientId/edit" element={<PatientForm />} />
            <Route path="/clinics/:clinicId/treatments" element={<TreatmentList />} />
            <Route path="/clinics/:clinicId/treatments/new" element={<TreatmentForm />} />
            <Route path="/clinics/:clinicId/treatments/:treatmentId" element={<TreatmentDetail />} />
            <Route path="/clinics/:clinicId/appointments" element={<AppointmentList />} />
            <Route path="/clinics/:clinicId/appointments/new" element={<AppointmentForm />} />
            <Route path="/clinics/:clinicId/appointments/:id/edit" element={<AppointmentDetail />} />
            <Route path="/clinics/:clinicId/calendar" element={<CalendarView />} />
            <Route path="/clinics/:clinicId/reports" element={<Reports/>} />
            <Route path="/clinics/:clinicId/suppliers" element={<SupplierList />} />
            <Route path="/clinics/:clinicId/inventory/items" element={<ItemList />} />
            <Route path="/clinics/:clinicId/inventory/items/new" element={<ItemForm />} />
            <Route path="/clinics/:clinicId/inventory/items/:itemId/edit" element={<ItemForm />} />
            <Route path="/clinics/:clinicId/inventory/batches" element={<ItemBatchList />} />
            <Route path="/clinics/:clinicId/inventory/transactions" element={<TransactionHistory />} />
            <Route path="/clinics/:clinicId/lab-partners" element={<LabPartnerList />} />
            <Route path="/clinics/:clinicId/lab-orders" element={<LabOrderList />} />
            <Route path="/clinics/:clinicId/lab-management" element={<LabManagement />} />
            <Route path="/clinics/:clinicId/lab-orders/new" element={<LabOrderForm />} />
            <Route path="/clinics/:clinicId/lab-orders/:labOrderId/edit" element={<LabOrderForm />} />
            <Route path="/clinics/:clinicId/treatments/:treatmentId/lab-orders/new" element={<LabOrderForm />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
