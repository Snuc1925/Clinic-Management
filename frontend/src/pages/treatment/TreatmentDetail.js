import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treatmentService, paymentService } from '../../services/api';
import './TreatmentManagement.css';

function TreatmentDetail() {
  const { clinicId, treatmentId } = useParams();
  const navigate = useNavigate();
  const [treatment, setTreatment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTreatmentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentId]);

  const loadTreatmentData = async () => {
    try {
      setLoading(true);
      const treatmentResponse = await treatmentService.getTreatment(clinicId, treatmentId);
      setTreatment(treatmentResponse.data);

      const paymentsResponse = await paymentService.getTreatmentPayments(treatmentId);
      setPayments(paymentsResponse.data);

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load treatment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await paymentService.addPayment(treatmentId, paymentForm);
      setShowPaymentForm(false);
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: ''
      });
      loadTreatmentData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment');
    }
  };

  const handlePaymentFormChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading treatment details...</div>;
  }

  if (error && !treatment) {
    return <div className="error-message">{error}</div>;
  }

  if (!treatment) {
    return <div className="error-message">Treatment not found</div>;
  }

  return (
    <div className="treatment-detail">
      <div className="header">
        <h2>Treatment Details</h2>
        <div className="actions">
          <button onClick={() => navigate(`/clinics/${clinicId}/treatments`)}>
            Back to Treatments
          </button>
          <button onClick={() => navigate(`/clinics/${clinicId}/patients/${treatment.patientId}`)}>
            View Patient
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="treatment-info-card">
        <h3>Treatment Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Patient:</label>
            <span>{treatment.patientName}</span>
          </div>
          <div className="info-item">
            <label>Doctor:</label>
            <span>{treatment.doctorName}</span>
          </div>
          <div className="info-item">
            <label>Date:</label>
            <span>{treatment.date}</span>
          </div>
          <div className="info-item">
            <label>Total Payment:</label>
            <span>${treatment.totalPayment}</span>
          </div>
          <div className="info-item">
            <label>Paid Amount:</label>
            <span>${treatment.paidAmount}</span>
          </div>
          <div className="info-item">
            <label>Remaining Balance:</label>
            <span className={treatment.remainingBalance > 0 ? 'text-danger' : ''}>
              ${treatment.remainingBalance}
            </span>
          </div>
          <div className="info-item">
            <label>Payment Status:</label>
            <span className={`status ${treatment.paymentStatus}`}>
              {treatment.paymentStatus}
            </span>
          </div>
          {treatment.description && (
            <div className="info-item full-width">
              <label>Description:</label>
              <span className="note-text">{treatment.description}</span>
            </div>
          )}
        </div>
      </div>

      <div className="payment-section">
        <div className="section-header">
          <h3>Payment History</h3>
          {treatment.remainingBalance > 0 && (
            <button 
              onClick={() => setShowPaymentForm(!showPaymentForm)} 
              className="primary"
            >
              {showPaymentForm ? 'Cancel' : 'Add Payment'}
            </button>
          )}
        </div>

        {showPaymentForm && (
          <form onSubmit={handleAddPayment} className="payment-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={paymentForm.amount}
                  onChange={handlePaymentFormChange}
                  step="0.01"
                  min="0.01"
                  max={treatment.remainingBalance}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date *</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={paymentForm.paymentDate}
                  onChange={handlePaymentFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={paymentForm.paymentMethod}
                  onChange={handlePaymentFormChange}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={paymentForm.notes}
                onChange={handlePaymentFormChange}
                placeholder="Optional payment notes"
              />
            </div>
            <button type="submit" className="primary">Add Payment</button>
          </form>
        )}

        {payments.length === 0 ? (
          <p>No payments recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.paymentDate}</td>
                  <td>${payment.amount}</td>
                  <td>{payment.paymentMethod || 'N/A'}</td>
                  <td>{payment.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TreatmentDetail;
