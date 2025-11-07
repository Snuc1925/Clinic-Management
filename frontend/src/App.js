import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClinicList from './pages/clinic/ClinicList';
import CreateClinic from './pages/clinic/CreateClinic';
import JoinClinic from './pages/clinic/JoinClinic';
import ClinicManagement from './pages/clinic/ClinicManagement';
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
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
