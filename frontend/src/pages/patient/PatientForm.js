import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/api';
import './PatientManagement.css';

function PatientForm() {
  const { clinicId, patientId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!patientId && patientId !== 'new';

  useEffect(() => {
    if (isEdit) {
      loadPatient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatient(clinicId, patientId);
      setFormData({
        fullName: response.data.fullName || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        dateOfBirth: response.data.dateOfBirth || '',
        note: response.data.note || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (isEdit) {
        await patientService.updatePatient(clinicId, patientId, formData);
      } else {
        await patientService.createPatient(clinicId, formData);
      }

      navigate(`/clinics/${clinicId}/patients`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="patient-form-container">
      <div className="header">
        <h2>{isEdit ? 'Edit Patient' : 'Add New Patient'}</h2>
        <button onClick={() => navigate(`/clinics/${clinicId}/patients`)}>
          Back to Patients
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="note">Doctor Notes</label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="5"
            placeholder="Private notes for medical history, allergies, etc."
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/clinics/${clinicId}/patients`)}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="primary">
            {loading ? 'Saving...' : (isEdit ? 'Update Patient' : 'Add Patient')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientForm;
