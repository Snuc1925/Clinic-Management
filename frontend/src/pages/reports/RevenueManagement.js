import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  alpha,
  Tooltip as MuiTooltip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  CalendarMonth as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { clinicService } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import axios from 'axios';

// Helper function to get Monday of the week
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// Helper function to get Sunday of the week
function getSunday(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

// Custom Calendar Component for Monthly Revenue
function RevenueCalendar({ revenueData, expensesData, viewType, currentMonth, onPrevMonth, onNextMonth }) {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  
  const weeks = [];
  let days = [];
  
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
    if (days.length === 7) {
      weeks.push(days);
      days = [];
    }
  }
  
  // Add remaining days
  if (days.length > 0) {
    while (days.length < 7) {
      days.push(null);
    }
    weeks.push(days);
  }

  const getValueForDay = (day) => {
    if (!day) return 0;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const revenue = revenueData?.[dateStr] || 0;
    const expenses = expensesData?.[dateStr] || 0;
    
    if (viewType === 'revenue') return revenue;
    if (viewType === 'expenses') return expenses;
    return revenue - expenses; // profit
  };

  // Calculate max value for color scaling
  const allValues = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const value = getValueForDay(day);
    if (value > 0) allValues.push(value);
  }
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1;

  const getColor = (value) => {
    if (value === 0) return '#f5f5f5';
    if (value < 0) return '#ffcdd2'; // Light red for negative profit
    const intensity = value / maxValue;
    if (intensity > 0.75) return '#1976d2';
    if (intensity > 0.5) return '#42a5f5';
    if (intensity > 0.25) return '#90caf9';
    return '#bbdefb';
  };

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <IconButton onClick={onPrevMonth} color="primary">
          <ChevronLeftIcon />
        </IconButton>
        
        <Typography variant="h6" fontWeight="bold">
          Tháng:  {month + 1} - {year}
        </Typography>
        
        <IconButton onClick={onNextMonth} color="primary">
          <ChevronRightIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {weekDays.map(day => (
          <Box
            key={day}
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              py: 1,
              color: 'text.secondary',
              fontSize: '0.875rem',
            }}
          >
            {day}
          </Box>
        ))}
        
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const value = getValueForDay(day);
            return (
              <MuiTooltip
                key={`${weekIdx}-${dayIdx}`}
                title={day ? `${day}/${month + 1}/${year}: ${formatCurrency(value)}` : ''}
                arrow
              >
                <Box
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: day ? getColor(value) : 'transparent',
                    borderRadius: 1,
                    cursor: day ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    border: day ? '1px solid #e0e0e0' : 'none',
                    '&:hover': day ? {
                      transform: 'scale(1.1)',
                      boxShadow: 2,
                      zIndex: 1,
                    } : {},
                  }}
                >
                  {day && (
                    <>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: value > 0 ? 'white' : (value < 0 ? 'error.main' : 'text.primary') }}>
                        {day}
                      </Typography>
                      {value !== 0 && (
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: value > 0 ? 'white' : 'error.main', mt: 0.5 }}>
                          {Math.abs(value) >= 1000000 
                            ? `${value < 0 ? '-' : ''}${(Math.abs(value) / 1000000).toFixed(1)}M`
                            : Math.abs(value) >= 1000
                            ? `${value < 0 ? '-' : ''}${(Math.abs(value) / 1000).toFixed(0)}K`
                            : value.toFixed(0)
                          }
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </MuiTooltip>
            );
          })
        )}
      </Box>

      <Box mt={2} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 0.5 }} />
          <Typography variant="caption">Không có DT</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#bbdefb', borderRadius: 0.5 }} />
          <Typography variant="caption">Thấp</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width:  16, height: 16, bgcolor: '#42a5f5', borderRadius:  0.5 }} />
          <Typography variant="caption">Trung bình</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#1976d2', borderRadius: 0.5 }} />
          <Typography variant="caption">Cao</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function RevenueManagement({ clinicId, setUserRole }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // View type: 'revenue', 'expenses', or 'profit'
  const [viewType, setViewType] = useState('revenue');
  
  // Summary data (current period)
  const [summaryData, setSummaryData] = useState(null);
  
  // Weekly data
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  
  // Monthly data
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState({});
  const [monthlyExpenses, setMonthlyExpenses] = useState({});
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  
  // Yearly data
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState([]);
  const [yearlyLoading, setYearlyLoading] = useState(false);
  
  // All years summary
  const [allYearsData, setAllYearsData] = useState([]);
  const [allYearsLoading, setAllYearsLoading] = useState(false);

  // Format date for API
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load summary data (last 30 days)
  const loadSummaryData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get clinic members to check user role
      const membersResponse = await clinicService. getClinicMembers(clinicId);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.userId === storedUser.id);
      const role = currentMember?. role || '';
      setUserRole(role);

      // Only owners can view revenue
      if (role !== 'owner') {
        setError('Chỉ chủ sở hữu mới có quyền xem báo cáo doanh thu');
        setLoading(false);
        return;
      }

      // Fetch summary data (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const response = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/revenue`,
        {
          params: {
            startDate: formatDateForAPI(startDate),
            endDate: formatDateForAPI(endDate),
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSummaryData(response.data);

    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  }, [clinicId, navigate, setUserRole]);

  // Load weekly data
  const loadWeeklyData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setWeeklyLoading(true);
      const weekEnd = getSunday(currentWeekStart);

      const response = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/revenue`,
        {
          params: {
            startDate: formatDateForAPI(currentWeekStart),
            endDate: formatDateForAPI(weekEnd),
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Create data for all 7 days (Monday to Sunday)
      const dailyRevenueMap = response.data.dailyRevenue || {};
      const dailyExpensesMap = response.data.dailyExpenses || {};
      const chartData = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(currentWeekStart);
        currentDate.setDate(currentWeekStart.getDate() + i);
        const dateStr = formatDateForAPI(currentDate);
        const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][(i + 1) % 7];
        
        const revenue = dailyRevenueMap[dateStr] || 0;
        const expenses = dailyExpensesMap[dateStr] || 0;
        
        chartData.push({
          date: `${dayName} ${currentDate.getDate()}/${currentDate.getMonth() + 1}`,
          amount: revenue,
          revenue: revenue,
          expenses: expenses,
          profit: revenue - expenses,
          fullDate: dateStr,
        });
      }
      
      setWeeklyData(chartData);
    } catch (err) {
      console.error('Error loading weekly data:', err);
    } finally {
      setWeeklyLoading(false);
    }
  }, [clinicId, currentWeekStart]);

  // Load monthly data
  const loadMonthlyData = useCallback(async () => {
    const token = localStorage. getItem('token');
    if (!token) return;

    try {
      setMonthlyLoading(true);
      const monthStart = new Date(currentMonth. getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const response = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/revenue`,
        {
          params: {
            startDate: formatDateForAPI(monthStart),
            endDate: formatDateForAPI(monthEnd),
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMonthlyData(response.data.dailyRevenue || {});
      setMonthlyExpenses(response.data.dailyExpenses || {});
    } catch (err) {
      console.error('Error loading monthly data:', err);
    } finally {
      setMonthlyLoading(false);
    }
  }, [clinicId, currentMonth]);

  // Load yearly data
  const loadYearlyData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setYearlyLoading(true);
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31);

      const response = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/revenue`,
        {
          params: {
            startDate: formatDateForAPI(yearStart),
            endDate: formatDateForAPI(yearEnd),
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Group by month (Jan to Dec)
      const monthlyRevenue = {};
      const monthlyExpenses = {};
      for (let month = 0; month < 12; month++) {
        monthlyRevenue[month] = 0;
        monthlyExpenses[month] = 0;
      }

      const dailyRevenueMap = response.data.dailyRevenue || {};
      const dailyExpensesMap = response.data.dailyExpenses || {};
      
      Object.entries(dailyRevenueMap).forEach(([dateStr, amount]) => {
        const date = new Date(dateStr);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthlyRevenue[month] += amount;
        }
      });
      
      Object.entries(dailyExpensesMap).forEach(([dateStr, amount]) => {
        const date = new Date(dateStr);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthlyExpenses[month] += amount;
        }
      });

      const chartData = [];
      for (let month = 0; month < 12; month++) {
        chartData.push({
          month: `Tháng ${month + 1}`,
          amount: monthlyRevenue[month],
          revenue: monthlyRevenue[month],
          expenses: monthlyExpenses[month],
          profit: monthlyRevenue[month] - monthlyExpenses[month],
          monthNumber: month + 1,
        });
      }

      setYearlyData(chartData);
    } catch (err) {
      console.error('Error loading yearly data:', err);
    } finally {
      setYearlyLoading(false);
    }
  }, [clinicId, currentYear]);

  // Load all years summary
  const loadAllYearsData = useCallback(async () => {
    const token = localStorage. getItem('token');
    if (!token) return;

    try {
      setAllYearsLoading(true);
      
      // Get data from 5 years ago to current year
      const currentYearNum = new Date().getFullYear();
      const startYear = currentYearNum - 4;
      
      const yearStart = new Date(startYear, 0, 1);
      const yearEnd = new Date(currentYearNum, 11, 31);

      const response = await axios.get(
        `http://localhost:8080/api/clinics/${clinicId}/reports/revenue`,
        {
          params: {
            startDate: formatDateForAPI(yearStart),
            endDate: formatDateForAPI(yearEnd),
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Group by year
      const yearlyRevenue = {};
      const yearlyExpenses = {};
      for (let year = startYear; year <= currentYearNum; year++) {
        yearlyRevenue[year] = 0;
        yearlyExpenses[year] = 0;
      }

      const dailyRevenueMap = response.data.dailyRevenue || {};
      const dailyExpensesMap = response.data.dailyExpenses || {};
      
      Object.entries(dailyRevenueMap).forEach(([dateStr, amount]) => {
        const year = new Date(dateStr).getFullYear();
        if (yearlyRevenue[year] !== undefined) {
          yearlyRevenue[year] += amount;
        }
      });
      
      Object.entries(dailyExpensesMap).forEach(([dateStr, amount]) => {
        const year = new Date(dateStr).getFullYear();
        if (yearlyExpenses[year] !== undefined) {
          yearlyExpenses[year] += amount;
        }
      });

      const chartData = Object.keys(yearlyRevenue)
        .map((year) => ({
          year: `${year}`,
          amount: yearlyRevenue[year],
          revenue: yearlyRevenue[year],
          expenses: yearlyExpenses[year],
          profit: yearlyRevenue[year] - yearlyExpenses[year],
        }))
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));

      setAllYearsData(chartData);
    } catch (err) {
      console.error('Error loading all years data:', err);
    } finally {
      setAllYearsLoading(false);
    }
  }, [clinicId]);

  // Week navigation
  const handlePrevWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Month navigation
  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Year navigation
  const handlePrevYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  // Initial load
  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  // Load data when period changes
  useEffect(() => {
    loadWeeklyData();
  }, [loadWeeklyData]);

  useEffect(() => {
    loadMonthlyData();
  }, [loadMonthlyData]);

  useEffect(() => {
    loadYearlyData();
  }, [loadYearlyData]);

  useEffect(() => {
    loadAllYearsData();
  }, [loadAllYearsData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Calculate week range string
  const weekEnd = getSunday(currentWeekStart);
  const weekRangeStr = `${currentWeekStart.getDate()}/${currentWeekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}/${weekEnd.getFullYear()}`;

  // Helper to get the data key and label based on view type
  const getViewConfig = () => {
    switch (viewType) {
      case 'revenue':
        return { key: 'revenue', label: 'Doanh thu', color: '#667eea' };
      case 'expenses':
        return { key: 'expenses', label: 'Chi phí', color: '#f5576c' };
      case 'profit':
        return { key: 'profit', label: 'Lợi nhuận', color: '#43e97b' };
      default:
        return { key: 'revenue', label: 'Doanh thu', color: '#667eea' };
    }
  };

  const viewConfig = getViewConfig();

  return (
    <Box sx={{ pb: 4 }}>
      {/* View Type Selector */}
      <Box display="flex" justifyContent="center" mb={3}>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={(event, newViewType) => {
            if (newViewType !== null) {
              setViewType(newViewType);
            }
          }}
          aria-label="view type"
          sx={{
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1,
              fontWeight: 'bold',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            },
          }}
        >
          <ToggleButton value="revenue" aria-label="revenue">
            Thu
          </ToggleButton>
          <ToggleButton value="expenses" aria-label="expenses">
            Chi
          </ToggleButton>
          <ToggleButton value="profit" aria-label="profit">
            Lợi nhuận
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position:  'absolute',
                top:  -50,
                right: -50,
                width:  150,
                height: 150,
                borderRadius: '50%',
                bgcolor: alpha('#ffffff', 0.1),
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="500">
                  Tổng doanh thu
                </Typography>
                <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {formatCurrency(summaryData?. totalRevenue || 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                30 ngày gần nhất
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color:  'white',
              position:  'relative',
              overflow:  'hidden',
              '&::before': {
                content:  '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: alpha('#ffffff', 0.1),
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="500">
                  Tổng chi phí
                </Typography>
                <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb:  1 }}>
                {formatCurrency(summaryData?. totalExpenses || 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Chưa có dữ liệu chi tiết
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: 
                (summaryData?.profitLoss || 0) >= 0
                  ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                  :  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color:  'white',
              position:  'relative',
              overflow:  'hidden',
              '&::before': {
                content:  '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: alpha('#ffffff', 0.1),
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="500">
                  Lợi nhuận
                </Typography>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {formatCurrency(summaryData?.profitLoss || 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {(summaryData?.profitLoss || 0) >= 0 ? 'Tăng trưởng tốt' : 'Cần cải thiện'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Revenue Chart */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width:  6,
                  height: 40,
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  mr: 2,
                }}
              />
              <Typography variant="h5" fontWeight="bold">
                Tuần:  {weekRangeStr}
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              <IconButton onClick={handlePrevWeek} color="primary" size="small">
                <ChevronLeftIcon />
              </IconButton>
              <IconButton onClick={handleNextWeek} color="primary" size="small">
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
          
          {weeklyLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={viewConfig.color} stopOpacity={0.9} />
                    <stop offset="95%" stopColor={viewConfig.color} stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), viewConfig.label]}
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Legend />
                <Bar
                  dataKey={viewConfig.key}
                  fill="url(#colorWeekly)"
                  name={viewConfig.label}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" align="center" py={4}>
              Không có dữ liệu
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Monthly Revenue Calendar */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Box
              sx={{
                width: 6,
                height: 40,
                bgcolor: 'info.main',
                borderRadius: 1,
                mr: 2,
              }}
            />
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon sx={{ color: 'info.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Tháng
              </Typography>
            </Box>
          </Box>
          
          {monthlyLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <RevenueCalendar
              revenueData={monthlyData}
              expensesData={monthlyExpenses}
              viewType={viewType}
              currentMonth={currentMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          )}
        </CardContent>
      </Card>

      {/* Yearly Revenue Chart */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 6,
                  height: 40,
                  bgcolor: 'success.main',
                  borderRadius: 1,
                  mr: 2,
                }}
              />
              <Typography variant="h5" fontWeight="bold">
                Năm: {currentYear}
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              <IconButton onClick={handlePrevYear} color="primary" size="small">
                <ChevronLeftIcon />
              </IconButton>
              <IconButton onClick={handleNextYear} color="primary" size="small">
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
          
          {yearlyLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : yearlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={yearlyData}>
                <defs>
                  <linearGradient id="colorYearly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={viewConfig.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={viewConfig.color} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), viewConfig.label]}
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={viewConfig.key}
                  stroke={viewConfig.color}
                  strokeWidth={3}
                  fill="url(#colorYearly)"
                  name={viewConfig.label}
                />
                <Line
                  type="monotone"
                  dataKey={viewConfig.key}
                  stroke={viewConfig.color}
                  strokeWidth={2}
                  dot={{ fill: viewConfig.color, r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" align="center" py={4}>
              Không có dữ liệu
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* All Years Summary */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Box
              sx={{
                width: 6,
                height: 40,
                bgcolor: 'secondary.main',
                borderRadius: 1,
                mr: 2,
              }}
            />
            <Typography variant="h5" fontWeight="bold">
              Tổng quan theo năm
            </Typography>
          </Box>
          
          {allYearsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : allYearsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={allYearsData}>
                <defs>
                  <linearGradient id="colorAllYears" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={viewConfig.color} stopOpacity={0.9} />
                    <stop offset="95%" stopColor={viewConfig.color} stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), viewConfig.label]}
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Legend />
                <Bar
                  dataKey={viewConfig.key}
                  fill="url(#colorAllYears)"
                  name={viewConfig.label}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={100}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary" align="center" py={4}>
              Không có dữ liệu
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default RevenueManagement;