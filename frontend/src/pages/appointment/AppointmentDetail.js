import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack, // <--- Import Stack
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Event as AppointmentIcon,
  MedicalServices as DoctorIcon,
  Save as SaveIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  CheckCircle as StatusIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { appointmentService, clinicService } from '../../services/api';

function AppointmentDetail() {
  const { clinicId, id } = useParams();
  const navigate = useNavigate();

  // --- States (Giữ nguyên) ---
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    appointmentDate: '',
    description: '',
    status: '',
    patientId: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  // --- Load Data (Giữ nguyên) ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [appointmentRes, membersRes] = await Promise.all([
        appointmentService.getAppointment(clinicId, id),
        clinicService.getClinicMembers(clinicId),
      ]);

      const apt = appointmentRes.data;
      
      setFormData({
        patientName: apt.patientName || '',
        doctorName: apt.doctorName || '',
        patientId: apt.patientId,
        appointmentDate: apt.appointmentDate ? apt.appointmentDate.slice(0, 16) : '', 
        description: apt.description || '',
        status: apt.status || 'scheduled'
      });

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersRes.data.find(m => m.id === storedUser.id);
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
    if (!token) { navigate('/login'); return; }
    loadData();
  }, [loadData, navigate]);

  // --- Handlers (Giữ nguyên) ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        patientId: formData.patientId,
        description: formData.description,
        status: formData.status,
        appointmentDate: new Date(formData.appointmentDate).toISOString()
      };

      await appointmentService.updateAppointment(clinicId, id, payload);
      alert("Cập nhật thành công!");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật');
    }
  };

  if (loading) return (<Layout showClinicMenu clinicId={clinicId} userRole={userRole}><Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box></Layout>);

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box maxWidth="md" mx="auto">
        
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <AppointmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">Chi tiết Lịch hẹn</Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate(`/clinics/${clinicId}/appointments`)}
            >
                Quay lại
            </Button>
            <Button 
                variant="contained" 
                startIcon={<SaveIcon />} 
                onClick={handleSave}
            >
                Lưu thay đổi
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3, borderBottom: '1px solid #eee', pb: 1 }}>
                Thông tin & Cập nhật
            </Typography>
            
            {/* --- SỬ DỤNG STACK TẠI ĐÂY --- */}
            {/* spacing={3} tạo khoảng cách đều 24px giữa các phần tử */}
            <Stack spacing={3}>
              
              {/* 1. Bệnh nhân */}
              <TextField 
                  fullWidth 
                  label="Bệnh nhân" 
                  value={formData.patientName} 
                  disabled 
                  variant="filled"
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
              />

              {/* 2. Bác sĩ */}
              <TextField 
                  fullWidth 
                  label="Bác sĩ phụ trách" 
                  value={formData.doctorName} 
                  disabled 
                  variant="filled"
                  InputProps={{ startAdornment: <InputAdornment position="start"><DoctorIcon /></InputAdornment> }}
              />

              {/* 3. Thời gian hẹn */}
              <TextField
                  fullWidth
                  required
                  label="Thời gian hẹn"
                  type="datetime-local"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><TimeIcon /></InputAdornment> }}
              />

              {/* 4. Trạng thái */}
              <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select 
                      label="Trạng thái"
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange}
                      startAdornment={<InputAdornment position="start"><StatusIcon sx={{ ml: 1, color: 'action.active' }} /></InputAdornment>}
                  >
                      <MenuItem value="scheduled">Đã lên lịch (Scheduled)</MenuItem>
                      <MenuItem value="completed">Hoàn thành (Completed)</MenuItem>
                      <MenuItem value="cancelled">Đã hủy (Cancelled)</MenuItem>
                      <MenuItem value="no-show">Không đến (No-show)</MenuItem>
                  </Select>
              </FormControl>

              {/* 5. Mô tả */}
              <TextField
                  fullWidth
                  label="Mô tả / Ghi chú"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  placeholder="Nhập nội dung khám, triệu chứng hoặc ghi chú..."
                  InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                            <DescriptionIcon />
                        </InputAdornment>
                      ) 
                  }}
              />

            </Stack>
            {/* --- KẾT THÚC STACK --- */}

          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default AppointmentDetail;