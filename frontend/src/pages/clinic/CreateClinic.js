import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicService } from '../../services/api';
import './CreateClinic.css';

function CreateClinic() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!name.trim()) {
            setError('Please enter a clinic name');
            return;
        }

        setLoading(true);
        try {
            const response = await clinicService.createClinic(name);
            setSuccess(`Clinic created successfully! Clinic code: ${response.data.code}`);
            setName('');
            setTimeout(() => {
                navigate('/clinics');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create clinic');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/clinics');
    };

    return (
        <div className="create-clinic-container">
            <div className="create-clinic-box">
                <h2>Create New Clinic</h2>
                <form onSubmit={handleSubmit} className="create-clinic-form">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="name">Clinic Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter clinic name"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn-submit" 
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Clinic'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateClinic;
