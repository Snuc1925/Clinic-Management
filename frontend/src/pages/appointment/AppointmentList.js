import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Alert, CircularProgress, Card, CardContent, Chip, FormControl, Select, MenuItem, InputLabel,
  Tabs, Tab, Badge, Avatar, InputAdornment, useTheme, alpha, Fade, Tooltip, IconButton, 
  Grid, // <--- 1. Import Grid chuẩn từ @mui/material
  Stack 
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Event as AppointmentIcon, Add as AddIcon,
  FilterList as FilterIcon, Person as PersonIcon, MedicalServices as MedicalIcon,
  History as HistoryIcon, EventAvailable as EventAvailableIcon, EventBusy as EventBusyIcon,
  Today as TodayIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { appointmentService, clinicService } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
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

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.userId === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setError('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    loadAppointmentsAndRole();
  }, [loadAppointmentsAndRole, navigate]);

  // --- Helpers ---
  const getStatusLabel = (status) => ({ 'scheduled': 'Đã lên lịch', 'completed': 'Hoàn thành', 'cancelled': 'Đã hủy', 'no-show': 'Không đến' }[status] || status);
  const getStatusColor = (status) => ({ 'scheduled': 'info', 'completed': 'success', 'cancelled': 'error', 'no-show': 'warning' }[status] || 'default');
  
  const getAppointmentIcon = (appointmentDate) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const aptDate = new Date(appointmentDate); aptDate.setHours(0,0,0,0);
    const diffTime = aptDate.getTime() - today.getTime();
    if (diffTime === 0) return <TodayIcon />;
    if (diffTime > 0) return <EventAvailableIcon />;
    return <EventBusyIcon />;
  };

  // --- Filter & Sort ---
  const filteredAppointments = appointments.filter(apt => filter === 'all' || apt.status === filter);
  const sortedAppointments = [...filteredAppointments].sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingAppointments = sortedAppointments.filter(apt => new Date(apt.appointmentDate) >= today);
  const pastAppointments = sortedAppointments.filter(apt => new Date(apt.appointmentDate) < today);

  // --- Render Table ---
  const renderAppointmentTable = (appointmentsList) => {
    if (appointmentsList.length === 0) {
      return (
        <Box textAlign="center" py={6}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}><AppointmentIcon sx={{ fontSize: 40 }} /></Avatar>
          <Typography variant="h6" color="text.secondary">Không tìm thấy lịch hẹn</Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Ngày hẹn</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Bệnh nhân</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Bác sĩ</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Chi tiết</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointmentsList.map((appointment, index) => (
              <TableRow 
                key={appointment.id} 
                hover
                sx={{
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04), transform: 'scale(1.005)', transition: 'all 0.2s' },
                  animation: `fadeInUp 0.5s ease-in-out ${index * 0.05}s both`,
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/clinics/${clinicId}/appointments/${appointment.id}/edit`)}
              >
                <TableCell sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: getStatusColor(appointment.status) + '.main', width: 40, height: 40 }}>{getAppointmentIcon(appointment.appointmentDate)}</Avatar>
                    <Box>
                      <Typography fontWeight="bold" variant="body2">{new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</Typography>
                      <Typography variant="caption" color="text.secondary">ID: {appointment.id}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight="medium">{appointment.patientName || 'N/A'}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MedicalIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{appointment.doctorName || 'N/A'}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2, maxWidth: 200 }}>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {appointment.description || 'Không có mô tả'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip label={getStatusLabel(appointment.status)} color={getStatusColor(appointment.status)} size="small" sx={{ fontWeight: 600 }} />
                </TableCell>
                <TableCell align="center" sx={{ py: 2 }}>
                  <Tooltip title="Chi tiết / Chỉnh sửa">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/clinics/${clinicId}/appointments/${appointment.id}/edit`); 
                        }}
                      >
                          <ViewIcon />
                      </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) return (<Layout showClinicMenu clinicId={clinicId} userRole={userRole}><Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box></Layout>);

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        <Paper elevation={0} sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`, borderRadius: 3, p: 4, mb: 4, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ width: 64, height: 64, mr: 3, bgcolor: 'primary.main', background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` }}><AppointmentIcon sx={{ fontSize: 32 }} /></Avatar>
              <Box><Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Quản lý Lịch hẹn</Typography><Typography variant="body1" color="text.secondary">Theo dõi và sắp xếp lịch hẹn với bệnh nhân</Typography></Box>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/clinics/${clinicId}/manage`)} sx={{ borderRadius: 2, fontWeight: 600 }}>Quay lại</Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/clinics/${clinicId}/appointments/new`)} sx={{ borderRadius: 2, fontWeight: 600, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` }}>Đặt lịch hẹn</Button>
            </Box>
          </Box>
        </Paper>

        {error && <Fade in={!!error}><Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert></Fade>}
        
        {/* --- PHẦN THỐNG KÊ (Dùng Grid Cổ điển) --- */}
        {userRole === 'owner' && (
          // 2. Dùng cú pháp item xs={...} thay vì size={{...}}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">{appointments.length}</Typography>
                    <Typography variant="body2">Tổng lịch hẹn</Typography>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success">{appointments.filter(a => new Date(a.appointmentDate) >= new Date().setHours(0,0,0,0)).length}</Typography>
                    <Typography variant="body2">Sắp tới</Typography>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="info">{appointments.filter(a => new Date(a.appointmentDate).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)).length}</Typography>
                    <Typography variant="body2">Hôm nay</Typography>
                </Card>
            </Grid>
          </Grid>
        )}

        <Fade in timeout={600}>
          <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, color: 'white', p: 3 }}><Typography variant="h6" fontWeight="bold" gutterBottom><FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Lọc lịch hẹn</Typography></Box>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" gap={2} alignItems="center">
                <Typography variant="body1" fontWeight="medium">Trạng thái:</Typography>
                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Trạng thái" startAdornment={<InputAdornment position="start"><FilterIcon sx={{ color: 'text.secondary', ml: 1 }} /></InputAdornment>}>
                    <MenuItem value="all">Tất cả</MenuItem><MenuItem value="scheduled">Đã lên lịch</MenuItem><MenuItem value="completed">Hoàn thành</MenuItem><MenuItem value="cancelled">Đã hủy</MenuItem><MenuItem value="no-show">Không đến</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        <Fade in timeout={700}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, color: 'white', p: 3 }}><Typography variant="h6" fontWeight="bold">Danh sách Lịch hẹn</Typography></Box>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab icon={<Badge badgeContent={upcomingAppointments.length} color="primary"><EventAvailableIcon /></Badge>} label="Sắp tới" iconPosition="start" />
                  <Tab icon={<Badge badgeContent={pastAppointments.length} color="secondary"><HistoryIcon /></Badge>} label="Đã qua" iconPosition="start" />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}><Box p={3}>{renderAppointmentTable(upcomingAppointments)}</Box></TabPanel>
              <TabPanel value={tabValue} index={1}><Box p={3}>{renderAppointmentTable(pastAppointments)}</Box></TabPanel>
            </CardContent>
          </Card>
        </Fade>
      </Box>
      <style>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </Layout>
  );
}

export default AppointmentList;