import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clinicService } from '../../services/api';
import './ClinicManagement.css';

function ClinicManagement() {
    const { id } = useParams();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await clinicService.getClinicMembers(id);
                setMembers(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch clinic members');
                setLoading(false);
            }
        };
        fetchMembers();
    }, [id]);

    const refreshMembers = async () => {
        try {
            const response = await clinicService.getClinicMembers(id);
            setMembers(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch clinic members');
        }
    };

    const handleAccept = async (memberId) => {
        try {
            await clinicService.updateMemberStatus(id, memberId, 'accepted');
            refreshMembers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept member');
        }
    };

    const handleReject = async (memberId) => {
        try {
            await clinicService.updateMemberStatus(id, memberId, 'rejected');
            refreshMembers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject member');
        }
    };

    const handleRemove = async (memberId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await clinicService.removeMember(id, memberId);
                refreshMembers();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to remove member');
            }
        }
    };

    const handleBack = () => {
        navigate('/clinics');
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    const pendingMembers = members.filter(m => m.status === 'pending');
    const acceptedMembers = members.filter(m => m.status === 'accepted');
    const rejectedMembers = members.filter(m => m.status === 'rejected');

    return (
        <div className="clinic-management-container">
            <div className="clinic-management-header">
                <h2>Manage Clinic Members</h2>
                <button onClick={handleBack} className="btn-back">
                    Back to Clinics
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="clinic-management-content">
                {/* Pending Requests */}
                {pendingMembers.length > 0 && (
                    <div className="members-section">
                        <h3>Pending Requests ({pendingMembers.length})</h3>
                        <div className="members-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Requested On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingMembers.map((member) => (
                                        <tr key={member.id}>
                                            <td>{member.fullName}</td>
                                            <td>{member.phone}</td>
                                            <td>{member.address || 'N/A'}</td>
                                            <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleAccept(member.id)}
                                                    className="btn-accept"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(member.id)}
                                                    className="btn-reject"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Accepted Members */}
                <div className="members-section">
                    <h3>Accepted Members ({acceptedMembers.length})</h3>
                    {acceptedMembers.length === 0 ? (
                        <p className="no-data">No accepted members yet</p>
                    ) : (
                        <div className="members-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Role</th>
                                        <th>Joined On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {acceptedMembers.map((member) => (
                                        <tr key={member.id}>
                                            <td>{member.fullName}</td>
                                            <td>{member.phone}</td>
                                            <td>{member.address || 'N/A'}</td>
                                            <td>
                                                <span className={`role-badge ${member.role}`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                                            <td>
                                                {member.role !== 'owner' && (
                                                    <button
                                                        onClick={() => handleRemove(member.id)}
                                                        className="btn-remove"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Rejected Members */}
                {rejectedMembers.length > 0 && (
                    <div className="members-section">
                        <h3>Rejected Requests ({rejectedMembers.length})</h3>
                        <div className="members-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Rejected On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rejectedMembers.map((member) => (
                                        <tr key={member.id}>
                                            <td>{member.fullName}</td>
                                            <td>{member.phone}</td>
                                            <td>{member.address || 'N/A'}</td>
                                            <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleRemove(member.id)}
                                                    className="btn-remove"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClinicManagement;
