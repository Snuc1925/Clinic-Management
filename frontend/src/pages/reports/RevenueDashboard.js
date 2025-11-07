import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RevenueDashboard.css';

function RevenueDashboard() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week'); // week, month, year
  const [revenueData, setRevenueData] = useState(null);
  const [staffPerformance, setStaffPerformance] = useState([]);

  useEffect(() => {
    loadRevenueData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, clinicId]);

  const loadRevenueData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch revenue data
      const revenueResponse = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/revenue/${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRevenueData(revenueResponse.data);

      // Calculate start and end dates for staff performance
      const endDate = new Date();
      const startDate = new Date();
      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (period === 'year') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      // Fetch staff performance
      const staffResponse = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/staff-performance`,
        {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStaffPerformance(staffResponse.data);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return <div className="revenue-dashboard"><div className="loading">Loading revenue data...</div></div>;
  }

  return (
    <div className="revenue-dashboard">
      <div className="dashboard-header">
        <h1>Revenue Dashboard</h1>
        <button className="back-button" onClick={() => navigate(`/clinics/${clinicId}/manage`)}>
          ← Back to Clinic
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="period-selector">
        <button 
          className={period === 'week' ? 'active' : ''} 
          onClick={() => setPeriod('week')}
        >
          Week
        </button>
        <button 
          className={period === 'month' ? 'active' : ''} 
          onClick={() => setPeriod('month')}
        >
          Month
        </button>
        <button 
          className={period === 'year' ? 'active' : ''} 
          onClick={() => setPeriod('year')}
        >
          Year
        </button>
      </div>

      {revenueData && (
        <>
          <div className="revenue-summary">
            <div className="summary-card">
              <h3>Total Revenue</h3>
              <div className="amount revenue">{formatCurrency(revenueData.totalRevenue)}</div>
            </div>
            <div className="summary-card">
              <h3>Total Expenses</h3>
              <div className="amount expenses">{formatCurrency(revenueData.totalExpenses)}</div>
            </div>
            <div className="summary-card">
              <h3>Profit/Loss</h3>
              <div className={`amount ${revenueData.profitLoss >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(revenueData.profitLoss)}
              </div>
            </div>
            <div className="summary-card">
              <h3>Period</h3>
              <div className="period-dates">
                {formatDate(revenueData.startDate)} - {formatDate(revenueData.endDate)}
              </div>
            </div>
          </div>

          {revenueData.dailyRevenue && Object.keys(revenueData.dailyRevenue).length > 0 && (
            <div className="daily-revenue-section">
              <h2>Daily Revenue</h2>
              <div className="daily-revenue-chart">
                {Object.entries(revenueData.dailyRevenue)
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, amount]) => (
                    <div key={date} className="daily-bar">
                      <div className="bar-label">{formatDate(date)}</div>
                      <div className="bar-container">
                        <div 
                          className="bar" 
                          style={{
                            height: `${(amount / Math.max(...Object.values(revenueData.dailyRevenue))) * 200}px`
                          }}
                        >
                          <span className="bar-value">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {staffPerformance && staffPerformance.length > 0 && (
        <div className="staff-performance-section">
          <h2>Staff Performance</h2>
          <table className="performance-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Treatments</th>
                <th>Total Revenue</th>
                <th>Avg Revenue/Treatment</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance.map((staff) => (
                <tr key={staff.staffId}>
                  <td>{staff.staffName}</td>
                  <td>{staff.treatmentCount}</td>
                  <td>{formatCurrency(staff.totalRevenue)}</td>
                  <td>{formatCurrency(staff.averageRevenuePerTreatment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RevenueDashboard;
