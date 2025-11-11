import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tabs,
  Tab,
  Badge,
  Grid,
  Avatar,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Event as AppointmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  PersonOff as NoShowIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  AccessTime as TimeIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { appointmentService, clinicService } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function AppointmentList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [userRole, setUserRole] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const loadAppointmentsAndRole = useCallback(async () => {
    try {
      setLoading(true);
      const [appointmentsResponse, membersResponse] = await Promise.all([
        appointmentService.getClinicAppointments(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);

      setAppointments(appointmentsResponse.data);

      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadAppointmentsAndRole();
  }, [loadAppointmentsAndRole, navigate]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      loadAppointmentsAndRole();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái lịch hẹn');
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'scheduled': 'Đã lên lịch',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'no-show': 'Không đến'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'scheduled': 'info',
      'completed': 'success',
      'cancelled': 'error',
      'no-show': 'warning'
    };
    return colorMap[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'scheduled': <ScheduleIcon />,
      'completed': <CompleteIcon />,
      'cancelled': <CancelIcon />,
      'no-show': <NoShowIcon />
    };
    return iconMap[status] || <AppointmentIcon />;
  };

  const getAppointmentIcon = (appointmentDate) => {
    const today = new Date();
    const aptDate = new Date(appointmentDate);
    const diffTime = aptDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return <TodayIcon />;
    if (diffDays > 0) return <EventAvailableIcon />;
    return <EventBusyIcon />;
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    return new Date(a.appointmentDate) - new Date(b.appointmentDate);
  });

  const upcomingAppointments = sortedAppointments.filter(apt => 
    new Date(apt.appointmentDate) >= new Date()
  );

  const pastAppointments = sortedAppointments.filter(apt => 
    new Date(apt.appointmentDate) < new Date()
  );

  // Calculate today's appointments
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate).toDateString() === today
  );

  const renderAppointmentTable = (appointmentsList, showActions = false) => {
    if (appointmentsList.length === 0) {
      return (
        <Box textAlign="center" py={6}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            <AppointmentIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {showActions ? 'Không có lịch hẹn sắp tới' : 'Không có lịch hẹn trong quá khứ'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {showActions 
              ? 'Chưa có lịch hẹn nào được lên lịch trong tương lai'
              : 'Không có lịch hẹn nào đã diễn ra'
            }
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Thông tin lịch hẹn</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Bệnh nhân</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Bác sĩ</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
              {showActions && <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Thao tác</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {appointmentsList.map((appointment, index) => (
              <TableRow 
                key={appointment.id} 
                hover
                sx={{
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease-in-out',
                  },
                  animation: `fadeInUp 0.5s ease-in-out ${index * 0.1}s both`,
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: getStatusColor(appointment.status) + '.main',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getAppointmentIcon(appointment.appointmentDate)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="bold" variant="body2">
                        {new Date(appointment.appointmentDate).toLocaleString('vi-VN')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {appointment.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight="medium">
                      {appointment.patientName || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MedicalIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {appointment.doctorName || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2, maxWidth: 200 }}>
                  <Typography variant="body2" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {appointment.description || 'Không có mô tả'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={getStatusLabel(appointment.status)}
                    color={getStatusColor(appointment.status)}
                    size="small"
                    icon={getStatusIcon(appointment.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                {showActions && (
                  <TableCell align="center" sx={{ py: 2 }}>
                    {appointment.status === 'scheduled' && (
                      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                        <Tooltip title="Đánh dấu hoàn thành">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                            sx={{ 
                              borderRadius: 2, 
                              fontWeight: 600,
                              minWidth: 'auto',
                              px: 1.5,
                            }}
                          >
                            <CompleteIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Hủy lịch hẹn">
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            sx={{ 
                              borderRadius: 2, 
                              fontWeight: 600,
                              minWidth: 'auto',
                              px: 1.5,
                            }}
                          >
                            <CancelIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Đánh dấu vắng mặt">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleStatusChange(appointment.id, 'no-show')}
                            sx={{ 
                              borderRadius: 2, 
                              fontWeight: 600,
                              minWidth: 'auto',
                              px: 1.5,
                            }}
                          >
                            <NoShowIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Đang tải danh sách lịch hẹn...
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        {/* Enhanced Header */}
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
            borderRadius: 3,
            p: 4,
            mb: 4,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mr: 3,
                  bgcolor: 'primary.main',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
              >
                <AppointmentIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Quản lý Lịch hẹn
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Theo dõi và quản lý các cuộc hẹn với bệnh nhân
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật: {new Date().toLocaleDateString('vi-VN')} lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/clinics/${clinicId}/manage`)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Quay lại phòng khám
              </Button>
              <Button
                variant="contained"
                startIcon={<CalendarIcon />}
                onClick={() => navigate(`/clinics/${clinicId}/calendar`)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Xem lịch
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Enhanced Error Alert */}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Statistics Cards - Only for Owners */}
        {userRole === 'owner' && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Zoom in timeout={300}>
                <Card
                  sx={{
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <AppointmentIcon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {appointments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng lịch hẹn
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Zoom in timeout={400}>
                <Card
                  sx={{
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'info.main',
                      }}
                    >
                      <TodayIcon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {todayAppointments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lịch hẹn hôm nay
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Zoom in timeout={500}>
                <Card
                  sx={{
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'success.main',
                      }}
                    >
                      <ScheduleIcon />
                    </Avatar>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {upcomingAppointments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lịch hẹn sắp tới
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>
        )}

        {/* Enhanced Filter Card */}
        <Fade in timeout={600}>
          <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Lọc lịch hẹn
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Lọc theo trạng thái để xem các lịch hẹn cụ thể
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}>
                <Typography variant="body1" fontWeight="medium">
                  Lọc theo trạng thái:
                </Typography>
                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Trạng thái"
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterIcon sx={{ color: 'text.secondary', ml: 1 }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                      },
                    }}
                  >
                    <MenuItem value="all">Tất cả lịch hẹn</MenuItem>
                    <MenuItem value="scheduled">Đã lên lịch</MenuItem>
                    <MenuItem value="completed">Hoàn thành</MenuItem>
                    <MenuItem value="cancelled">Đã hủy</MenuItem>
                    <MenuItem value="no-show">Không đến</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {filter !== 'all' && (
                <Box mt={2}>
                  <Chip
                    label={`Lọc: ${getStatusLabel(filter)}`}
                    onDelete={() => setFilter('all')}
                    color="secondary"
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Tìm thấy <strong>{filteredAppointments.length}</strong> kết quả
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Enhanced Appointment Table */}
        <Fade in timeout={700}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                <AppointmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Danh sách lịch hẹn ({filteredAppointments.length})
              </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab 
                    icon={
                      <Badge badgeContent={upcomingAppointments.length} color="primary">
                        <ScheduleIcon />
                      </Badge>
                    } 
                    label="Lịch hẹn sắp tới" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={
                      <Badge badgeContent={pastAppointments.length} color="secondary">
                        <HistoryIcon />
                      </Badge>
                    } 
                    label="Lịch hẹn đã qua" 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Upcoming Appointments Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box p={3}>
                  <Box mb={2}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Lịch hẹn sắp tới ({upcomingAppointments.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Các lịch hẹn từ hôm nay trở đi
                    </Typography>
                  </Box>
                  {renderAppointmentTable(upcomingAppointments, true)}
                </Box>
              </TabPanel>

              {/* Past Appointments Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box p={3}>
                  <Box mb={2}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Lịch hẹn đã qua ({pastAppointments.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Các lịch hẹn đã diễn ra
                    </Typography>
                  </Box>
                  {renderAppointmentTable(pastAppointments, false)}
                </Box>
              </TabPanel>

              {filteredAppointments.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                    }}
                  >
                    <AppointmentIcon sx={{ fontSize: 50 }} />
                  </Avatar>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Không tìm thấy lịch hẹn nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {filter === 'all' 
                      ? 'Chưa có lịch hẹn nào được tạo'
                      : `Không có lịch hẹn nào với trạng thái "${getStatusLabel(filter)}"`
                    }
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Box>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}

export default AppointmentList;