import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Event as AppointmentIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
  MedicalServices as DoctorIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { appointmentService, clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters'; // Giả sử bạn dùng chung utils

function AppointmentDetail() {
  const { clinicId, id } = useParams(); // id ở đây là appointmentId
  const navigate = useNavigate();
  
  // --- States ---
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  // --- Data Loading ---
  const loadAppointmentData = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi song song để tối ưu hiệu năng giống TreatmentDetail
      const [appointmentResponse, membersResponse] = await Promise.all([
        appointmentService.getAppointment(clinicId, id),
        clinicService.getClinicMembers(clinicId),
      ]);

      setAppointment(appointmentResponse.data);

      // Xác định Role của User hiện tại
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin lịch hẹn');
    } finally {
      setLoading(false);
    }
  }, [clinicId, id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadAppointmentData();
  }, [loadAppointmentData, navigate]);

  // --- Handlers ---
  const handleStatusChange = async (newStatus) => {
    try {
        // Giả sử API update status có dạng này
        await appointmentService.updateAppointmentStatus(id, newStatus);
        loadAppointmentData(); // Reload lại dữ liệu sau khi update
    } catch (err) {
        setError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  // --- Helpers ---
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

  // --- Render ---
  if (loading) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error && !appointment) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/clinics/${clinicId}/appointments`)}>
                Quay lại danh sách
            </Button>
        </Box>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Alert severity="error">Không tìm thấy thông tin lịch hẹn</Alert>
      </Layout>
    );
  }

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <AppointmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Chi tiết Lịch hẹn
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/appointments`)}
            >
              Quay lại danh sách
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/patients/${appointment.patientId}`)}
            >
              Xem bệnh nhân
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/appointments/${id}/edit`)}
              disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
            >
              Chỉnh sửa
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Appointment Information Card - Structure copied from TreatmentDetail */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom color="primary">
              Thông tin Chung
            </Typography>
            <Grid container spacing={2}>
              {/* Cột 1: Thông tin cơ bản */}
              <Grid item xs={12} md={6}>
                 <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                        Bệnh nhân
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body1" fontWeight="medium">
                            {appointment.patientName}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                        Bác sĩ phụ trách
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <DoctorIcon fontSize="small" color="action" />
                            <Typography variant="body1" fontWeight="medium">
                            {appointment.doctorName}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                        Thời gian hẹn
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="body1" fontWeight="medium">
                                {/* Hiển thị đầy đủ ngày giờ */}
                                {new Date(appointment.appointmentDate).toLocaleString('vi-VN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        </Box>
                    </Grid>
                 </Grid>
              </Grid>

              {/* Cột 2: Trạng thái và Mô tả */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                        Trạng thái hiện tại
                        </Typography>
                        <Box mt={1}>
                        <Chip
                            label={getStatusLabel(appointment.status)}
                            color={getStatusColor(appointment.status)}
                            icon={appointment.status === 'completed' ? <CompleteIcon /> : undefined}
                        />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                        Mô tả / Ghi chú
                        </Typography>
                        <Box display="flex" alignItems="flex-start" gap={1} mt={0.5}>
                            <NotesIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {appointment.description || 'Không có mô tả'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Action Section - Similar logic to "Payment Section" in TreatmentDetail but for Status */}
        {appointment.status === 'scheduled' && (
            <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center">
                            <CompleteIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Typography variant="h6" component="h2" color="text.primary">
                            Thao tác nhanh
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Thay đổi trạng thái của lịch hẹn này. Hành động này sẽ cập nhật dữ liệu vào hệ thống.
                    </Typography>
                    
                    <Box display="flex" gap={2}>
                        <Button 
                            variant="contained" 
                            color="success" 
                            startIcon={<CompleteIcon />}
                            onClick={() => handleStatusChange('completed')}
                        >
                            Đánh dấu Hoàn thành
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            startIcon={<CancelIcon />}
                            onClick={() => handleStatusChange('cancelled')}
                        >
                            Hủy Lịch hẹn
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        )}

        {/* Nếu đã hoàn thành hoặc hủy, hiển thị Card thông báo trạng thái */}
        {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
            <Paper variant="outlined" sx={{ p: 3, bgcolor: appointment.status === 'completed' ? '#f0fdf4' : '#fef2f2', borderColor: appointment.status === 'completed' ? '#bbf7d0' : '#fecaca' }}>
                 <Box display="flex" alignItems="center" gap={2}>
                    {appointment.status === 'completed' ? (
                        <CompleteIcon color="success" fontSize="large" />
                    ) : (
                        <CancelIcon color="error" fontSize="large" />
                    )}
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color={appointment.status === 'completed' ? 'success.main' : 'error.main'}>
                            Lịch hẹn đã {getStatusLabel(appointment.status).toLowerCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Không thể thực hiện thêm thay đổi trạng thái cho lịch hẹn này.
                        </Typography>
                    </Box>
                 </Box>
            </Paper>
        )}

      </Box>
    </Layout>
  );
}

export default AppointmentDetail;