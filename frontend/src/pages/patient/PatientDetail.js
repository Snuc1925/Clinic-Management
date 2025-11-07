import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService, treatmentService, appointmentService } from '../../services/api';
import './PatientManagement.css';

function PatientDetail() {
  const { clinicId, patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const patientResponse = await patientService.getPatient(clinicId, patientId);
      setPatient(patientResponse.data);

      const treatmentsResponse = await treatmentService.getClinicTreatments(clinicId);
      const patientTreatments = treatmentsResponse.data.filter(t => t.patientId === parseInt(patientId));
      setTreatments(patientTreatments);

      const appointmentsResponse = await appointmentService.getClinicAppointments(clinicId);
      const patientAppointments = appointmentsResponse.data.filter(a => a.patientId === parseInt(patientId));
      setAppointments(patientAppointments);

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading patient details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!patient) {
    return <div className="error-message">Patient not found</div>;
  }

  return (
    <div className="patient-detail">
      <div className="header">
        <h2>Patient Details</h2>
        <div className="actions">
          <button onClick={() => navigate(`/clinics/${clinicId}/patients`)}>
            Back to Patients
          </button>
          <button onClick={() => navigate(`/clinics/${clinicId}/patients/${patientId}/edit`)}>
            Edit Patient
          </button>
          <button onClick={() => navigate(`/clinics/${clinicId}/treatments/new?patientId=${patientId}`)} className="primary">
            Add Treatment
          </button>
        </div>
      </div>

      <div className="patient-info-card">
        <h3>Patient Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Full Name:</label>
            <span>{patient.fullName}</span>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <span>{patient.phone || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Date of Birth:</label>
            <span>{patient.dateOfBirth || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Address:</label>
            <span>{patient.address || 'N/A'}</span>
          </div>
          {patient.note && (
            <div className="info-item full-width">
              <label>Doctor Notes:</label>
              <span className="note-text">{patient.note}</span>
            </div>
          )}
        </div>
      </div>

      <div className="treatments-section">
        <h3>Treatment History</h3>
        {treatments.length === 0 ? (
          <p>No treatments recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Description</th>
                <th>Total Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map(treatment => (
                <tr key={treatment.id}>
                  <td>{treatment.date}</td>
                  <td>{treatment.doctorName}</td>
                  <td>{treatment.description}</td>
                  <td>${treatment.totalPayment}</td>
                  <td>
                    <span className={`status ${treatment.paymentStatus}`}>
                      {treatment.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => navigate(`/clinics/${clinicId}/treatments/${treatment.id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="appointments-section">
        <h3>Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments scheduled.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Doctor</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>
                  <td>{appointment.doctorName}</td>
                  <td>{appointment.description}</td>
                  <td>
                    <span className={`status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PatientDetail;
