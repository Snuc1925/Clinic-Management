import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
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
import CalendarView from './pages/appointment/CalendarView';
import RevenueDashboard from './pages/reports/RevenueDashboard';
import SupplierList from './pages/inventory/SupplierList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="/clinics/:clinicId/calendar" element={<CalendarView />} />
          <Route path="/clinics/:clinicId/reports/revenue" element={<RevenueDashboard />} />
          <Route path="/clinics/:clinicId/suppliers" element={<SupplierList />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
