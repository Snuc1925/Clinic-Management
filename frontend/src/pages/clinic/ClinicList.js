import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicService } from '../../services/api';
import './ClinicList.css';

function ClinicList() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            const response = await clinicService.getUserClinics();
            setClinics(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch clinics');
            setLoading(false);
        }
    };

    const handleManageClinic = (clinicId) => {
        navigate(`/clinics/${clinicId}/manage`);
    };

    const handleCreateClinic = () => {
        navigate('/clinics/create');
    };

    const handleJoinClinic = () => {
        navigate('/clinics/join');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="clinic-list-container">
            <div className="clinic-list-header">
                <h2>My Clinics</h2>
                <div className="header-actions">
                    <button onClick={handleBackToDashboard} className="btn-back">
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="clinic-list-actions">
                <button onClick={handleCreateClinic} className="btn-primary">
                    Create New Clinic
                </button>
                <button onClick={handleJoinClinic} className="btn-secondary">
                    Join Clinic
                </button>
            </div>

            <div className="clinic-list-content">
                {error && <div className="error-message">{error}</div>}
                
                {clinics.length === 0 ? (
                    <div className="no-clinics">
                        <p>You haven't joined or created any clinics yet.</p>
                        <p>Create a new clinic or join an existing one using the buttons above.</p>
                    </div>
                ) : (
                    <div className="clinics-grid">
                        {clinics.map((clinic) => (
                            <div key={clinic.id} className="clinic-card">
                                <div className="clinic-card-header">
                                    <h3>{clinic.name}</h3>
                                    <span className={`role-badge ${clinic.role}`}>
                                        {clinic.role}
                                    </span>
                                </div>
                                <div className="clinic-card-body">
                                    <div className="clinic-info">
                                        <span className="info-label">Clinic Code:</span>
                                        <span className="info-value">{clinic.code}</span>
                                    </div>
                                    <div className="clinic-info">
                                        <span className="info-label">Status:</span>
                                        <span className={`status-badge ${clinic.status}`}>
                                            {clinic.status}
                                        </span>
                                    </div>
                                    <div className="clinic-info">
                                        <span className="info-label">Created:</span>
                                        <span className="info-value">
                                            {new Date(clinic.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {clinic.role === 'owner' && clinic.status === 'accepted' && (
                                    <div className="clinic-card-footer">
                                        <button 
                                            onClick={() => handleManageClinic(clinic.id)}
                                            className="btn-manage"
                                        >
                                            Manage Clinic
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClinicList;
