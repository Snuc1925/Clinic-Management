import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { treatmentService, patientService, appointmentService } from '../../services/api';
import './TreatmentManagement.css';

function TreatmentForm() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    totalPayment: ''
  });
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    interval: '1week',
    customDate: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientService.getClinicPatients(clinicId);
      setPatients(response.data);
    } catch (err) {
      setError('Failed to load patients');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const treatmentResponse = await treatmentService.createTreatment(clinicId, formData);

      if (showAppointment) {
        const appointmentDate = calculateAppointmentDate();
        await appointmentService.createAppointment(clinicId, {
          patientId: formData.patientId,
          appointmentDate: appointmentDate,
          description: appointmentData.description || 'Follow-up appointment',
          status: 'scheduled'
        });
      }

      navigate(`/clinics/${clinicId}/treatments/${treatmentResponse.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create treatment');
      setLoading(false);
    }
  };

  const calculateAppointmentDate = () => {
    const baseDate = new Date(formData.date);
    
    if (appointmentData.interval === 'custom') {
      return new Date(appointmentData.customDate).toISOString();
    }

    const intervals = {
      '1week': 7,
      '2weeks': 14,
      '1month': 30,
      '3months': 90,
      '6months': 180
    };

    baseDate.setDate(baseDate.getDate() + intervals[appointmentData.interval]);
    return baseDate.toISOString();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAppointmentChange = (e) => {
    setAppointmentData({
      ...appointmentData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="treatment-form-container">
      <div className="header">
        <h2>Create New Treatment</h2>
        <button onClick={() => navigate(`/clinics/${clinicId}/treatments`)}>
          Back to Treatments
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="treatment-form">
        <div className="form-group">
          <label htmlFor="patientId">Patient *</label>
          <select
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
          >
            <option value="">Select a patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} {patient.phone ? `- ${patient.phone}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Treatment Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalPayment">Total Payment Amount *</label>
          <input
            type="number"
            id="totalPayment"
            name="totalPayment"
            value={formData.totalPayment}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Treatment Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Describe the treatment, procedures performed, medications prescribed, etc."
          />
        </div>

        <div className="appointment-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showAppointment}
              onChange={(e) => setShowAppointment(e.target.checked)}
            />
            Schedule follow-up appointment
          </label>

          {showAppointment && (
            <div className="appointment-fields">
              <div className="form-group">
                <label htmlFor="interval">Appointment Interval</label>
                <select
                  id="interval"
                  name="interval"
                  value={appointmentData.interval}
                  onChange={handleAppointmentChange}
                >
                  <option value="1week">1 Week</option>
                  <option value="2weeks">2 Weeks</option>
                  <option value="1month">1 Month</option>
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>

              {appointmentData.interval === 'custom' && (
                <div className="form-group">
                  <label htmlFor="customDate">Custom Appointment Date</label>
                  <input
                    type="datetime-local"
                    id="customDate"
                    name="customDate"
                    value={appointmentData.customDate}
                    onChange={handleAppointmentChange}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="appointmentDescription">Appointment Description</label>
                <input
                  type="text"
                  id="appointmentDescription"
                  name="description"
                  value={appointmentData.description}
                  onChange={handleAppointmentChange}
                  placeholder="e.g., Follow-up checkup"
                />
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/clinics/${clinicId}/treatments`)}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="primary">
            {loading ? 'Creating...' : 'Create Treatment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TreatmentForm;
