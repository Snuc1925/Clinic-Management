import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  List as ListIcon,
  CalendarMonth as CalendarIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Today as TodayIcon,
  Event as AppointmentIcon,
  LocalHospital as TreatmentIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { appointmentService, treatmentService, clinicService } from '../../services/api';

function CalendarView() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();

      const [appointmentResponse, treatmentResponse, membersResponse] = await Promise.all([
        appointmentService.getCalendarData ? 
          appointmentService.getCalendarData(clinicId, start.toISOString(), end.toISOString()) :
          appointmentService.getClinicAppointments(clinicId),
        treatmentService.getClinicTreatments(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);

      // Filter appointments if getCalendarData doesn't exist
      let filteredAppointments = appointmentResponse.data;
      if (!appointmentService.getCalendarData) {
        filteredAppointments = appointmentResponse.data.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= start && aptDate <= end;
        });
      }
      setAppointments(filteredAppointments);

      const filteredTreatments = treatmentResponse.data.filter(t => {
        const treatmentDate = new Date(t.date);
        return treatmentDate >= start && treatmentDate <= end;
      });
      setTreatments(filteredTreatments);

      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.userId === storedUser.id);
      setUserRole(currentMember?.role || '');

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu lịch');
    } finally {
      setLoading(false);
    }
  }, [clinicId, currentDate, viewMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadCalendarData();
  }, [loadCalendarData, navigate]);

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === dateStr;
    });

    const dayTreatments = treatments.filter(t => {
      return t.date === dateStr;
    });

    return { appointments: dayAppointments, treatments: dayTreatments };
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'scheduled': 'Đã lên lịch',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'no-show': 'Không đến',
      'paid': 'Đã thanh toán',
      'partial': 'Thanh toán một phần',
      'unpaid': 'Chưa thanh toán'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'scheduled': 'info',
      'completed': 'success',
      'cancelled': 'error',
      'no-show': 'warning',
      'paid': 'success',
      'partial': 'warning',
      'unpaid': 'error'
    };
    return colorMap[status] || 'default';
  };

  const renderMonthView = () => {
    const { start } = getDateRange();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = start.getDay();
    
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    const days = [];
    
    // Add weekday headers
    weekDays.forEach(day => {
      days.push(
        <Box key={day} sx={{ 
          p: 1, 
          textAlign: 'center', 
          fontWeight: 'bold', 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'grey.100'
        }}>
          {day}
        </Box>
      );
    });

    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <Box key={`empty-${i}`} sx={{ minHeight: 120, border: 1, borderColor: 'divider' }} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <Box key={day} sx={{ 
          minHeight: 120, 
          border: 1, 
          borderColor: 'divider',
          p: 1,
          bgcolor: isToday ? 'primary.50' : 'background.paper',
          position: 'relative'
        }}>
          <Typography 
            variant="body2" 
            fontWeight={isToday ? 'bold' : 'normal'}
            color={isToday ? 'primary.main' : 'text.primary'}
          >
            {day}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            {events.appointments.map(apt => (
              <Box key={`apt-${apt.id}`} sx={{ mb: 0.5 }}>
                <Chip
                  icon={<AppointmentIcon />}
                  label={`${new Date(apt.appointmentDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - ${apt.patientName}`}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            ))}
            {events.treatments.map(t => (
              <Box key={`treat-${t.id}`} sx={{ mb: 0.5 }}>
                <Chip
                  icon={<TreatmentIcon />}
                  label={`Điều trị: ${t.patientName}`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 0,
        border: 1,
        borderColor: 'divider'
      }}>
        {days}
      </Box>
    );
  };

  const renderListView = () => {
    const DEFAULT_TREATMENT_TIME = 'T12:00:00';
    
    const allEvents = [
      ...appointments.map(apt => ({
        type: 'appointment',
        date: new Date(apt.appointmentDate),
        data: apt
      })),
      ...treatments.map(t => ({
        type: 'treatment',
        date: new Date(t.date + DEFAULT_TREATMENT_TIME),
        data: t
      }))
    ].sort((a, b) => a.date - b.date);

    return (
      <Paper>
        {allEvents.length === 0 ? (
          <Box textAlign="center" py={6}>
            <CalendarIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Không có sự kiện nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Không có lịch hẹn hoặc điều trị nào trong khoảng thời gian này
            </Typography>
          </Box>
        ) : (
          <List>
            {allEvents.map((event, idx) => (
              <React.Fragment key={idx}>
                <ListItem>
                  <ListItemIcon>
                    {event.type === 'appointment' ? 
                      <AppointmentIcon color="info" /> : 
                      <TreatmentIcon color="success" />
                    }
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight="medium">
                          {event.type === 'appointment' ? 'Lịch hẹn' : 'Điều trị'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.date.toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Bệnh nhân: <strong>{event.data.patientName}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Bác sĩ: <strong>{event.data.doctorName}</strong>
                        </Typography>
                        <Box mt={1}>
                          <Chip
                            label={getStatusLabel(event.type === 'appointment' ? event.data.status : event.data.paymentStatus)}
                            color={getStatusColor(event.type === 'appointment' ? event.data.status : event.data.paymentStatus)}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < allEvents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    );
  };

  const getDateDisplayText = () => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      return `Tuần của ${currentDate.toLocaleDateString('vi-VN')}`;
    } else {
      return currentDate.toLocaleDateString('vi-VN', options);
    }
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

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <CalendarIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Xem Lịch
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ListIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/appointments`)}
            >
              Xem danh sách
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/manage`)}
            >
              Quay lại phòng khám
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={() => navigateDate(-1)}>
                  <PrevIcon />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                  {getDateDisplayText()}
                </Typography>
                <IconButton onClick={() => navigateDate(1)}>
                  <NextIcon />
                </IconButton>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                >
                  <ToggleButton value="day">Ngày</ToggleButton>
                  <ToggleButton value="week">Tuần</ToggleButton>
                  <ToggleButton value="month">Tháng</ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="outlined"
                  startIcon={<TodayIcon />}
                  onClick={() => setCurrentDate(new Date())}
                  size="small"
                >
                  Hôm nay
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            {viewMode === 'month' && renderMonthView()}
            {(viewMode === 'day' || viewMode === 'week') && renderListView()}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Chú thích
            </Typography>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                <AppointmentIcon color="info" />
                <Typography variant="body2">Lịch hẹn</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <TreatmentIcon color="success" />
                <Typography variant="body2">Điều trị</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default CalendarView;