import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SupplierList.css';

function SupplierList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    paymentTerms: '',
    notes: ''
  });

  useEffect(() => {
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  const loadSuppliers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/suppliers`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuppliers(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editingSupplier) {
        await axios.put(
          `http://localhost:8080/api/clinics/${clinicId}/suppliers/${editingSupplier.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:8080/api/clinics/${clinicId}/suppliers`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowForm(false);
      setEditingSupplier(null);
      resetForm();
      loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      contactPhone: supplier.contactPhone || '',
      contactEmail: supplier.contactEmail || '',
      address: supplier.address || '',
      paymentTerms: supplier.paymentTerms || '',
      notes: supplier.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (supplierId) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `http://localhost:8080/api/clinics/${clinicId}/suppliers/${supplierId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      address: '',
      paymentTerms: '',
      notes: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSupplier(null);
    resetForm();
  };

  if (loading) {
    return <div className="supplier-list"><div className="loading">Loading suppliers...</div></div>;
  }

  return (
    <div className="supplier-list">
      <div className="header">
        <h1>Suppliers</h1>
        <div className="header-buttons">
          <button className="back-button" onClick={() => navigate(`/clinics/${clinicId}/manage`)}>
            ← Back
          </button>
          <button className="add-button" onClick={() => setShowForm(true)}>
            + Add Supplier
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Payment Terms</label>
                <input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="e.g., Net 30"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingSupplier ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="suppliers-grid">
        {suppliers.length === 0 ? (
          <div className="no-data">No suppliers found. Click "Add Supplier" to create one.</div>
        ) : (
          suppliers.map((supplier) => (
            <div key={supplier.id} className="supplier-card">
              <div className="supplier-header">
                <h3>{supplier.name}</h3>
                <div className="supplier-actions">
                  <button onClick={() => handleEdit(supplier)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(supplier.id)} className="delete-btn">Delete</button>
                </div>
              </div>
              <div className="supplier-details">
                {supplier.contactPerson && (
                  <p><strong>Contact:</strong> {supplier.contactPerson}</p>
                )}
                {supplier.contactPhone && (
                  <p><strong>Phone:</strong> {supplier.contactPhone}</p>
                )}
                {supplier.contactEmail && (
                  <p><strong>Email:</strong> {supplier.contactEmail}</p>
                )}
                {supplier.address && (
                  <p><strong>Address:</strong> {supplier.address}</p>
                )}
                {supplier.paymentTerms && (
                  <p><strong>Payment Terms:</strong> {supplier.paymentTerms}</p>
                )}
                {supplier.notes && (
                  <p><strong>Notes:</strong> {supplier.notes}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SupplierList;
