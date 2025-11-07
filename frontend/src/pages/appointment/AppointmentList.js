import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/api';
import './AppointmentManagement.css';

function AppointmentList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getClinicAppointments(clinicId);
      setAppointments(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return new Date(a.appointmentDate) - new Date(b.appointmentDate);
  });

  const upcomingAppointments = sortedAppointments.filter(apt => 
    new Date(apt.appointmentDate) >= new Date()
  );

  const pastAppointments = sortedAppointments.filter(apt => 
    new Date(apt.appointmentDate) < new Date()
  );

  return (
    <div className="appointment-management">
      <div className="header">
        <h2>Appointment Management</h2>
        <div className="actions">
          <button onClick={() => navigate(`/clinics/${clinicId}/manage`)}>
            Back to Clinic
          </button>
          <button onClick={() => navigate(`/clinics/${clinicId}/calendar`)} className="primary">
            Calendar View
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-bar">
        <label>Filter by status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Appointments</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No-show</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : (
        <>
          {upcomingAppointments.length > 0 && (
            <div className="appointments-section">
              <h3>Upcoming Appointments ({upcomingAppointments.length})</h3>
              <div className="appointments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>
                        <td>{appointment.patientName}</td>
                        <td>{appointment.doctorName}</td>
                        <td>{appointment.description || 'N/A'}</td>
                        <td>
                          <span className={`status ${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button onClick={() => handleStatusChange(appointment.id, 'completed')} className="btn-success">
                                Complete
                              </button>
                              <button onClick={() => handleStatusChange(appointment.id, 'cancelled')} className="btn-warning">
                                Cancel
                              </button>
                              <button onClick={() => handleStatusChange(appointment.id, 'no-show')} className="btn-secondary">
                                No-show
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pastAppointments.length > 0 && (
            <div className="appointments-section">
              <h3>Past Appointments ({pastAppointments.length})</h3>
              <div className="appointments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>{new Date(appointment.appointmentDate).toLocaleString()}</td>
                        <td>{appointment.patientName}</td>
                        <td>{appointment.doctorName}</td>
                        <td>{appointment.description || 'N/A'}</td>
                        <td>
                          <span className={`status ${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredAppointments.length === 0 && (
            <div className="no-data">No appointments found</div>
          )}
        </>
      )}
    </div>
  );
}

export default AppointmentList;
