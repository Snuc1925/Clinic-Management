import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treatmentService } from '../../services/api';
import './TreatmentManagement.css';

function TreatmentList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTreatments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      const response = await treatmentService.getClinicTreatments(clinicId);
      setTreatments(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load treatments');
    } finally {
      setLoading(false);
    }
  };

  const filteredTreatments = treatments.filter(treatment => {
    if (filter === 'all') return true;
    return treatment.paymentStatus === filter;
  });

  return (
    <div className="treatment-management">
      <div className="header">
        <h2>Treatment Management</h2>
        <div className="actions">
          <button onClick={() => navigate(`/clinics/${clinicId}/manage`)}>
            Back to Clinic
          </button>
          <button onClick={() => navigate(`/clinics/${clinicId}/treatments/new`)} className="primary">
            New Treatment
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-bar">
        <label>Filter by payment status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Treatments</option>
          <option value="paid">Paid</option>
          <option value="partial">Partially Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading treatments...</div>
      ) : (
        <div className="treatments-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Description</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No treatments found</td>
                </tr>
              ) : (
                filteredTreatments.map(treatment => (
                  <tr key={treatment.id}>
                    <td>{treatment.date}</td>
                    <td>{treatment.patientName}</td>
                    <td>{treatment.doctorName}</td>
                    <td>{treatment.description ? treatment.description.substring(0, 50) + '...' : 'N/A'}</td>
                    <td>${treatment.totalPayment}</td>
                    <td>${treatment.paidAmount}</td>
                    <td>${treatment.remainingBalance}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TreatmentList;
