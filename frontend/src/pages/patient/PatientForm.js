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
  Stack 
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { patientService, clinicService } from '../../services/api';

function PatientForm() {
  const { clinicId, patientId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const isEdit = !!patientId && patientId !== 'new';

  const loadPatient = useCallback(async () => {
    try {
      setLoading(true);
      const [patientResponse, membersResponse] = await Promise.all([
        patientService.getPatient(clinicId, patientId),
        clinicService.getClinicMembers(clinicId),
      ]);

      setFormData({
        fullName: patientResponse.data.fullName || '',
        phone: patientResponse.data.phone || '',
        address: patientResponse.data.address || '',
        dateOfBirth: patientResponse.data.dateOfBirth || '',
        note: patientResponse.data.note || ''
      });

      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  }, [clinicId, patientId]);

  const loadUserRole = useCallback(async () => {
    try {
      const membersResponse = await clinicService.getClinicMembers(clinicId);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');
    } catch (err) {
      console.error('Failed to load user role');
    }
  }, [clinicId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (isEdit) {
      loadPatient();
    } else {
      loadUserRole();
    }
  }, [isEdit, loadPatient, loadUserRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (isEdit) {
        await patientService.updatePatient(clinicId, patientId, formData);
      } else {
        await patientService.createPatient(clinicId, formData);
      }

      navigate(`/clinics/${clinicId}/patients`);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu thông tin bệnh nhân');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading && isEdit) {
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
            {isEdit ? (
              <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            ) : (
              <PersonAddIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            )}
            <Typography variant="h4" component="h1" fontWeight="bold">
              {isEdit ? 'Chỉnh sửa Bệnh nhân' : 'Thêm Bệnh nhân mới'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/clinics/${clinicId}/patients`)}
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
              
              {/* SỬ DỤNG STACK ĐỂ XẾP DỌC CÁC TRƯỜNG */}
              <Stack spacing={3}>
                
                <TextField
                  fullWidth
                  label="Họ và tên *"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Ngày sinh"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: '9999-12-31' }} // Giới hạn năm 4 số
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Ghi chú của bác sĩ"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Ghi chú riêng về lịch sử bệnh, dị ứng, v.v..."
                  variant="outlined"
                />

              </Stack>
              {/* KẾT THÚC STACK */}

              <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate(`/clinics/${clinicId}/patients`)}
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
                  {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm bệnh nhân')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default PatientForm;