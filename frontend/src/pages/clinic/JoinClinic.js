import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicService } from '../../services/api';
import './JoinClinic.css';

function JoinClinic() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!code.trim()) {
            setError('Please enter a clinic code');
            return;
        }

        if (code.trim().length !== 6) {
            setError('Clinic code must be 6 characters');
            return;
        }

        setLoading(true);
        try {
            await clinicService.joinClinic(code.trim().toUpperCase());
            setSuccess('Join request sent successfully! Waiting for clinic owner approval.');
            setCode('');
            setTimeout(() => {
                navigate('/clinics');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join clinic');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/clinics');
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.toUpperCase();
        if (value.length <= 6) {
            setCode(value);
        }
    };

    return (
        <div className="join-clinic-container">
            <div className="join-clinic-box">
                <h2>Join Clinic</h2>
                <p className="join-clinic-description">
                    Enter the 6-character clinic code to request to join an existing clinic.
                </p>
                <form onSubmit={handleSubmit} className="join-clinic-form">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="code">Clinic Code</label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={handleCodeChange}
                            placeholder="Enter 6-character code"
                            disabled={loading}
                            maxLength={6}
                            style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', fontSize: '20px' }}
                        />
                        <small className="code-hint">
                            Code is case-insensitive and contains letters and numbers
                        </small>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn-submit" 
                            disabled={loading}
                        >
                            {loading ? 'Sending Request...' : 'Join Clinic'}
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

export default JoinClinic;
