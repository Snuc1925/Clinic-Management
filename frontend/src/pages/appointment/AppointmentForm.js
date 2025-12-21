import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Event as AppointmentIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { appointmentService, patientService, clinicService } from '../../services/api';

function AppointmentForm() {
  const { clinicId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  // --- States ---
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '', // Format: YYYY-MM-DDTHH:mm
    description: '',
    status: 'scheduled'
  });

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  // --- Load Data ---
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Tải danh sách bệnh nhân (để chọn) & Role
      const [patientsRes, membersRes] = await Promise.all([
        patientService.getClinicPatients(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);
      setPatients(patientsRes.data);

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersRes.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');

      // 2. Nếu là Edit, tải thông tin Appointment cũ
      if (isEdit) {
        // Lưu ý: Cần đảm bảo api.js có hàm getAppointment(id) hoặc getAppointment(clinicId, id)
        // Nếu API trả về appointmentDate dạng ISO full (2025-12-20T14:30:00.000Z), cần cắt lấy YYYY-MM-DDTHH:mm
        const aptRes = await appointmentService.getAppointment(clinicId, id); // Hoặc appointmentService.getAppointment(id) tùy API của bạn
        const data = aptRes.data;

        setFormData({
          patientId: data.patientId,
          // Format lại ngày giờ để hiển thị đúng trong input datetime-local
          appointmentDate: data.appointmentDate ? data.appointmentDate.slice(0, 16) : '',
          description: data.description || '',
          status: data.status || 'scheduled'
        });
      }

    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [clinicId, id, isEdit]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadInitialData();
  }, [loadInitialData, navigate]);

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Chuẩn bị payload (nếu cần xử lý ngày giờ)
      const payload = {
        ...formData,
        // Đảm bảo gửi ISO String về server
        appointmentDate: new Date(formData.appointmentDate).toISOString()
      };

      if (isEdit) {
        // Cần thêm hàm updateAppointment trong api.js nếu chưa có
        await appointmentService.updateAppointment(clinicId, id, payload); 
      } else {
        await appointmentService.createAppointment(clinicId, payload);
      }

      navigate(`/clinics/${clinicId}/appointments`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch hẹn.');
      setLoading(false);
    }
  };

  if (loading && patients.length === 0) {
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
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            {isEdit ? (
               <EditIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            ) : (
               <AddIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            )}
            <Typography variant="h4" component="h1" fontWeight="bold">
              {isEdit ? 'Chỉnh sửa Lịch hẹn' : 'Tạo Lịch hẹn mới'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/clinics/${clinicId}/appointments`)}
          >
            Quay lại danh sách
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              
              {/* SỬ DỤNG STACK ĐỂ XẾP DỌC - MỖI Ô 1 DÒNG */}
              <Stack spacing={3}>
                
                <Box>
                    <Typography variant="h6" component="h2" gutterBottom color="primary">
                        <AppointmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Thông tin Lịch hẹn
                    </Typography>
                </Box>

                {/* 1. Chọn Bệnh nhân */}
                <FormControl fullWidth required>
                  <InputLabel>Bệnh nhân</InputLabel>
                  <Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    label="Bệnh nhân"
                    disabled={isEdit} // Thường không cho đổi bệnh nhân khi sửa lịch (tùy nghiệp vụ)
                  >
                    <MenuItem value=""><em>-- Chọn bệnh nhân --</em></MenuItem>
                    {patients.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.fullName} {p.phone ? `- ${p.phone}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 2. Ngày giờ hẹn */}
                <TextField
                  fullWidth
                  required
                  label="Thời gian hẹn"
                  name="appointmentDate"
                  type="datetime-local"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />

                {/* 3. Trạng thái (Chỉ hiện khi Edit hoặc nếu muốn set ngay từ đầu) */}
                <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="Trạng thái"
                    >
                        <MenuItem value="scheduled">Đã lên lịch (Scheduled)</MenuItem>
                        <MenuItem value="completed">Đã hoàn thành (Completed)</MenuItem>
                        <MenuItem value="cancelled">Đã hủy (Cancelled)</MenuItem>
                        <MenuItem value="no-show">Không đến (No-show)</MenuItem>
                    </Select>
                </FormControl>

                {/* 4. Mô tả */}
                <TextField
                  fullWidth
                  label="Mô tả / Ghi chú"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Nhập lý do khám, ghi chú thêm..."
                />

              </Stack>
              {/* KẾT THÚC STACK */}

              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate(`/clinics/${clinicId}/appointments`)}
                  disabled={loading}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo lịch hẹn')}
                </Button>
              </Box>

            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default AppointmentForm;