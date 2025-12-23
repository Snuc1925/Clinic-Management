import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../../components/Layout';
import { clinicService } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import axios from 'axios';

const COLORS = ['#03A9F4', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

function RevenueDashboard() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');
  const [revenueData, setRevenueData] = useState(null);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [userRole, setUserRole] = useState('');

  const loadRevenueData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get clinic members to check user role
      const membersResponse = await clinicService.getClinicMembers(clinicId);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      const role = currentMember?.role || '';
      setUserRole(role);

      // Only owners can view revenue
      if (role !== 'owner') {
        setError('Chỉ chủ sở hữu mới có quyền xem báo cáo doanh thu');
        setLoading(false);
        return;
      }

      // Fetch revenue data
      const revenueResponse = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/revenue/${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRevenueData(revenueResponse.data);

      // Calculate dates
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
      try {
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
        // Only silently handle 404 (endpoint not implemented) or 403 (no data available)
        if (err.response?.status !== 404 && err.response?.status !== 403) {
          console.error('Unexpected error fetching staff performance:', err);
        }
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  }, [period, clinicId, navigate]);

  useEffect(() => {
    loadRevenueData();
  }, [loadRevenueData]);

  if (loading) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error && userRole !== 'owner') {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Alert severity="error">{error}</Alert>
      </Layout>
    );
  }

  const chartData = revenueData?.dailyRevenue
    ? Object.entries(revenueData.dailyRevenue)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, amount]) => ({
          date: formatDate(date),
          amount: amount,
        }))
    : [];

  const pieData = [
    { name: 'Doanh thu', value: revenueData?.totalRevenue || 0 },
    { name: 'Chi phí', value: revenueData?.totalExpenses || 0 },
  ];

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <AssessmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Thống kê, Báo cáo
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="center" mb={3}>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(e, newPeriod) => newPeriod && setPeriod(newPeriod)}
            aria-label="Chọn kỳ báo cáo"
          >
            <ToggleButton value="week">Tuần</ToggleButton>
            <ToggleButton value="month">Tháng</ToggleButton>
            <ToggleButton value="year">Năm</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {revenueData && (
          <>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <MoneyIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Tổng doanh thu</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(revenueData.totalRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <TrendingDownIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Tổng chi phí</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(revenueData.totalExpenses)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: revenueData.profitLoss >= 0 ? 'success.main' : 'error.main', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <TrendingUpIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">Lợi nhuận</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(revenueData.profitLoss)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Kỳ báo cáo</Typography>
                    <Typography variant="body1">
                      {formatDate(revenueData.startDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">đến</Typography>
                    <Typography variant="body1">
                      {formatDate(revenueData.endDate)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {chartData.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Biểu đồ doanh thu theo ngày</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="amount" fill="#03A9F4" name="Doanh thu" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {pieData.some(d => d.value > 0) && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Tỷ lệ doanh thu và chi phí</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {staffPerformance && staffPerformance.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Hiệu suất làm việc</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nhân viên</strong></TableCell>
                      <TableCell align="right"><strong>Số điều trị</strong></TableCell>
                      <TableCell align="right"><strong>Tổng doanh thu</strong></TableCell>
                      <TableCell align="right"><strong>TB/điều trị</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffPerformance.map((staff) => (
                      <TableRow key={staff.staffId}>
                        <TableCell>{staff.staffName}</TableCell>
                        <TableCell align="right">{staff.treatmentCount}</TableCell>
                        <TableCell align="right">{formatCurrency(staff.totalRevenue)}</TableCell>
                        <TableCell align="right">{formatCurrency(staff.averageRevenuePerTreatment)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </Layout>
  );
}

export default RevenueDashboard;