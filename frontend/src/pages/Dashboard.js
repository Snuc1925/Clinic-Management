import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await userService.getAllUsers();
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(id);
                setError('');
                fetchUsers();
            } catch (err) {
                setError('Failed to delete user. Please try again.');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Clinic Management Dashboard</h2>
                <button onClick={handleLogout} className="btn-logout">
                    Logout
                </button>
            </div>

            <div className="dashboard-content">
                <h3>User List</h3>
                {error && <div className="error-message">{error}</div>}
                <div className="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Phone</th>
                                <th>Full Name</th>
                                <th>Address</th>
                                <th>Date of Birth</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.address || 'N/A'}</td>
                                    <td>{user.dateOfBirth || 'N/A'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <p className="no-data">No users found</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
