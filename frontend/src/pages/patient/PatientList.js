import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/api';
import './PatientManagement.css';

function PatientList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getClinicPatients(clinicId);
      setPatients(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(clinicId, patientId);
        loadPatients();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete patient');
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  return (
    <div className="patient-management">
      <div className="header">
        <h2>Patient Management</h2>
        <div className="actions">
          <button onClick={() => navigate(`/clinics/${clinicId}/manage`)}>
            Back to Clinic
          </button>
          <button onClick={() => navigate(`/clinics/${clinicId}/patients/new`)} className="primary">
            Add Patient
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search patients by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading patients...</div>
      ) : (
        <div className="patients-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Date of Birth</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No patients found</td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>{patient.fullName}</td>
                    <td>{patient.phone || 'N/A'}</td>
                    <td>{patient.dateOfBirth || 'N/A'}</td>
                    <td>{patient.address || 'N/A'}</td>
                    <td className="actions-cell">
                      <button onClick={() => navigate(`/clinics/${clinicId}/patients/${patient.id}`)}>
                        View
                      </button>
                      <button onClick={() => navigate(`/clinics/${clinicId}/patients/${patient.id}/edit`)}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(patient.id)} className="danger">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientList;
