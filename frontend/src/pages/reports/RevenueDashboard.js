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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Layout from '../../components/Layout';
import { clinicService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import axios from 'axios';
import './RevenueDashboard.css';

const COLORS = ['#03A9F4', '#4CAF50', '#FF9800', '#F44336'];

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

function RevenueDashboard() {
  const { clinicId } = useParams();
  const navigate = useNavigate();

  // mặc định 1 tháng gần nhất 
  const todayDate = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  );
  const today = todayDate.toISOString().split('T')[0];

  const oneMonthAgo = new Date(todayDate);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [startDate, setStartDate] = useState(
    oneMonthAgo.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revenueData, setRevenueData] = useState(null);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [userRole, setUserRole] = useState('');

  // Load data
  const loadRevenueData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!startDate || !endDate) {
      setError('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    if (startDate > endDate) {
      setError('Ngày bắt đầu không được sau ngày kết thúc');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const membersResponse = await clinicService.getClinicMembers(clinicId);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(
        m => m.id === storedUser.id
      );
      const role = currentMember?.role || '';
      setUserRole(role);

      if (role !== 'owner') {
        setError('Chỉ chủ sở hữu mới có quyền xem báo cáo doanh thu');
        return;
      }

      const revenueResponse = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/revenue`,
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRevenueData(revenueResponse.data);

      try {
        const staffResponse = await axios.get(
          `http://localhost:8080/api/clinics/${clinicId}/reports/staff-performance`,
          {
            params: { startDate, endDate },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStaffPerformance(staffResponse.data);
      } catch (err) {
        if (err.response?.status !== 404 && err.response?.status !== 403) {
          console.error(err);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, clinicId, navigate]);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const handleApply = () => {
    loadRevenueData();
  };

  if (loading) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const chartData = revenueData?.dailyRevenue
    ? Object.entries(revenueData.dailyRevenue)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, amount]) => ({
          date: formatDisplayDate(date),
          amount,
        }))
    : [];

  const pieData = [
    { name: 'Doanh thu', value: revenueData?.totalRevenue || 0 },
    { name: 'Chi phí', value: revenueData?.totalExpenses || 0 },
  ];

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box className="revenue-dashboard">
        <Box display="flex" alignItems="center" mb={3}>
          <AssessmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight="bold">
            Thống kê, Báo cáo
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {}
        <div className="period-selector">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span>→</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={e => setEndDate(e.target.value)}
          />
          <button className="confirm-button" onClick={handleApply}>
            Xác nhận
          </button>
        </div>

        {revenueData && (
          <>
            {}
            <Grid container spacing={3} mb={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <MoneyIcon sx={{ fontSize: 38 }} />
                    <Typography mt={1}>Tổng doanh thu</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(revenueData.totalRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingDownIcon sx={{ fontSize: 38 }} />
                    <Typography mt={1}>Tổng chi phí</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(revenueData.totalExpenses)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    bgcolor:
                      revenueData.profitLoss >= 0
                        ? 'success.main'
                        : 'error.main',
                    color: 'white',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 38 }} />
                    <Typography mt={1}>Lợi nhuận</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(revenueData.profitLoss)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {}
            {chartData.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Doanh thu theo ngày
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={v => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="amount" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {}
            {pieData.some(p => p.value > 0) && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tỷ lệ doanh thu & chi phí
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {staffPerformance.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hiệu suất nhân viên
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nhân viên</strong></TableCell>
                      <TableCell align="right"><strong>Số điều trị</strong></TableCell>
                      <TableCell align="right"><strong>Doanh thu</strong></TableCell>
                      <TableCell align="right"><strong>TB/điều trị</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffPerformance.map(s => (
                      <TableRow key={s.staffId}>
                        <TableCell>{s.staffName}</TableCell>
                        <TableCell align="right">{s.treatmentCount}</TableCell>
                        <TableCell align="right">{formatCurrency(s.totalRevenue)}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(s.averageRevenuePerTreatment)}
                        </TableCell>
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
