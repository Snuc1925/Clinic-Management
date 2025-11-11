import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Collapse,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalHospital as TreatmentIcon,
  Add as AddIcon,
  Event as AppointmentIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { treatmentService, patientService, appointmentService, clinicService } from '../../services/api';

function TreatmentForm() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    totalPayment: ''
  });
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    interval: '1week',
    customDate: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  const loadPatientsAndRole = useCallback(async () => {
    try {
      const [patientsResponse, membersResponse] = await Promise.all([
        patientService.getClinicPatients(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);

      setPatients(patientsResponse.data);

      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');

    } catch (err) {
      setError('Không thể tải danh sách bệnh nhân');
    }
  }, [clinicId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadPatientsAndRole();
  }, [loadPatientsAndRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const treatmentResponse = await treatmentService.createTreatment(clinicId, formData);

      if (showAppointment) {
        const appointmentDate = calculateAppointmentDate();
        await appointmentService.createAppointment(clinicId, {
          patientId: formData.patientId,
          appointmentDate: appointmentDate,
          description: appointmentData.description || 'Lịch hẹn tái khám',
          status: 'scheduled'
        });
      }

      navigate(`/clinics/${clinicId}/treatments/${treatmentResponse.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo điều trị mới');
      setLoading(false);
    }
  };

  const calculateAppointmentDate = () => {
    const baseDate = new Date(formData.date);
    
    if (appointmentData.interval === 'custom') {
      return new Date(appointmentData.customDate).toISOString();
    }

    const intervals = {
      '1week': 7,
      '2weeks': 14,
      '1month': 30,
      '3months': 90,
      '6months': 180
    };

    baseDate.setDate(baseDate.getDate() + intervals[appointmentData.interval]);
    return baseDate.toISOString();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAppointmentChange = (e) => {
    setAppointmentData({
      ...appointmentData,
      [e.target.name]: e.target.value
    });
  };

  const getIntervalLabel = (interval) => {
    const intervalMap = {
      '1week': '1 Tuần',
      '2weeks': '2 Tuần',
      '1month': '1 Tháng',
      '3months': '3 Tháng',
      '6months': '6 Tháng',
      'custom': 'Tùy chỉnh ngày'
    };
    return intervalMap[interval] || interval;
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Tạo Điều trị mới
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/clinics/${clinicId}/treatments`)}
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
              <Grid container spacing={3}>
                {/* Patient Selection */}
                <Grid item xs={12}>
                  <Typography variant="h6" component="h2" gutterBottom color="primary">
                    <TreatmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Thông tin Điều trị
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Bệnh nhân</InputLabel>
                    <Select
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      label="Bệnh nhân"
                    >
                      <MenuItem value="">
                        <em>Chọn bệnh nhân</em>
                      </MenuItem>
                      {patients.map(patient => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.fullName} {patient.phone ? `- ${patient.phone}` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ngày điều trị *"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tổng chi phí *"
                    name="totalPayment"
                    type="number"
                    value={formData.totalPayment}
                    onChange={handleChange}
                    inputProps={{
                      step: "1",
                      min: "0"
                    }}
                    InputProps={{
                      endAdornment: <Typography variant="body2" color="text.secondary">VND</Typography>
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả điều trị"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Mô tả về điều trị, quy trình thực hiện, thuốc được kê đơn, v.v..."
                  />
                </Grid>

                {/* Appointment Section */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" alignItems="center" mb={2}>
                    <AppointmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2" color="primary">
                      Lịch hẹn tái khám
                    </Typography>
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showAppointment}
                        onChange={(e) => setShowAppointment(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Lên lịch hẹn tái khám"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Collapse in={showAppointment}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Khoảng thời gian</InputLabel>
                            <Select
                              name="interval"
                              value={appointmentData.interval}
                              onChange={handleAppointmentChange}
                              label="Khoảng thời gian"
                            >
                              <MenuItem value="1week">1 Tuần</MenuItem>
                              <MenuItem value="2weeks">2 Tuần</MenuItem>
                              <MenuItem value="1month">1 Tháng</MenuItem>
                              <MenuItem value="3months">3 Tháng</MenuItem>
                              <MenuItem value="6months">6 Tháng</MenuItem>
                              <MenuItem value="custom">Tùy chỉnh ngày</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {appointmentData.interval === 'custom' && (
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Ngày hẹn tùy chỉnh"
                              name="customDate"
                              type="datetime-local"
                              value={appointmentData.customDate}
                              onChange={handleAppointmentChange}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                            />
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Mô tả lịch hẹn"
                            name="description"
                            value={appointmentData.description}
                            onChange={handleAppointmentChange}
                            placeholder="Ví dụ: Kiểm tra tái khám"
                            size="small"
                          />
                        </Grid>

                        {appointmentData.interval !== 'custom' && (
                          <Grid item xs={12}>
                            <Alert severity="info" sx={{ mt: 1 }}>
                              Lịch hẹn sẽ được tự động tính toán sau ngày điều trị{' '}
                              <strong>{getIntervalLabel(appointmentData.interval).toLowerCase()}</strong>
                            </Alert>
                          </Grid>
                        )}
                      </Grid>
                    </Card>
                  </Collapse>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate(`/clinics/${clinicId}/treatments`)}
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
                  {loading ? 'Đang tạo...' : 'Tạo điều trị'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default TreatmentForm;