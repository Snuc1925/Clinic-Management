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
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
  LocalHospital as TreatmentIcon,
  Event as AppointmentIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { patientService, treatmentService, appointmentService, clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

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

function PatientDetail() {
  const { clinicId, patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const loadPatientData = useCallback(async () => {
    try {
      setLoading(true);
      const [patientResponse, treatmentsResponse, appointmentsResponse, membersResponse] = await Promise.all([
        patientService.getPatient(clinicId, patientId),
        treatmentService.getClinicTreatments(clinicId),
        appointmentService.getClinicAppointments(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);

      setPatient(patientResponse.data);
      
      const patientTreatments = treatmentsResponse.data.filter(t => t.patientId === Number(patientId));
      setTreatments(patientTreatments);

      const patientAppointments = appointmentsResponse.data.filter(a => a.patientId === Number(patientId));
      setAppointments(patientAppointments);

      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.userId === storedUser.id);
      setUserRole(currentMember?.role || '');

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  }, [clinicId, patientId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadPatientData();
  }, [loadPatientData, navigate]);

  const getPaymentStatusLabel = (status) => {
    const statusMap = {
      'paid': 'Đã thanh toán',
      'partial': 'Thanh toán một phần',
      'unpaid': 'Chưa thanh toán'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colorMap = {
      'paid': 'success',
      'partial': 'warning',
      'unpaid': 'error'
    };
    return colorMap[status] || 'default';
  };

  const getAppointmentStatusLabel = (status) => {
    const statusMap = {
      'scheduled': 'Đã lên lịch',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'no_show': 'Không đến'
    };
    return statusMap[status] || status;
  };

  const getAppointmentStatusColor = (status) => {
    const colorMap = {
      'scheduled': 'info',
      'completed': 'success',
      'cancelled': 'error',
      'no_show': 'warning'
    };
    return colorMap[status] || 'default';
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

  if (error && !patient) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Alert severity="error">{error}</Alert>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Alert severity="error">Không tìm thấy thông tin bệnh nhân</Alert>
      </Layout>
    );
  }

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Chi tiết Bệnh nhân
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/patients`)}
            >
              Quay lại danh sách
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/patients/${patientId}/edit`)}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/treatments/new?patientId=${patientId}`)}
            >
              Thêm điều trị
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Patient Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom color="primary">
              Thông tin Bệnh nhân
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Họ và tên
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient.fullName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient.phone || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Ngày sinh
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Địa chỉ
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient.address || 'N/A'}
                </Typography>
              </Grid>
              {patient.note && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Ghi chú của bác sĩ
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {patient.note}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs for Treatments and Appointments */}
        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab 
                  icon={<TreatmentIcon />} 
                  label={`Lịch sử Điều trị (${treatments.length})`} 
                  iconPosition="start"
                />
                <Tab 
                  icon={<AppointmentIcon />} 
                  label={`Lịch hẹn (${appointments.length})`} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Treatments Tab */}
            <TabPanel value={tabValue} index={0}>
              {treatments.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Chưa có điều trị nào được ghi nhận.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Ngày</strong></TableCell>
                        <TableCell><strong>Bác sĩ</strong></TableCell>
                        <TableCell><strong>Mô tả</strong></TableCell>
                        <TableCell><strong>Tổng chi phí</strong></TableCell>
                        <TableCell><strong>Trạng thái</strong></TableCell>
                        <TableCell align="right"><strong>Thao tác</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {treatments.map(treatment => (
                        <TableRow key={treatment.id} hover>
                          <TableCell>
                            {treatment.date ? formatDate(treatment.date) : 'N/A'}
                          </TableCell>
                          <TableCell>{treatment.doctorName || 'N/A'}</TableCell>
                          <TableCell>
                            {treatment.description && treatment.description.length > 50
                              ? treatment.description.substring(0, 50) + '...'
                              : (treatment.description || 'N/A')
                            }
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium" color="info.main">
                              {treatment.totalPayment?.toLocaleString('vi-VN') || '0'} VND
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getPaymentStatusLabel(treatment.paymentStatus)}
                              color={getPaymentStatusColor(treatment.paymentStatus)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/clinics/${clinicId}/treatments/${treatment.id}`)}
                              title="Xem chi tiết"
                            >
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>

            {/* Appointments Tab */}
            <TabPanel value={tabValue} index={1}>
              {appointments.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  Chưa có lịch hẹn nào được lên lịch.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Ngày & Giờ</strong></TableCell>
                        <TableCell><strong>Bác sĩ</strong></TableCell>
                        <TableCell><strong>Mô tả</strong></TableCell>
                        <TableCell><strong>Trạng thái</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments.map(appointment => (
                        <TableRow key={appointment.id} hover>
                          <TableCell>
                            {new Date(appointment.appointmentDate).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell>{appointment.doctorName || 'N/A'}</TableCell>
                          <TableCell>{appointment.description || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={getAppointmentStatusLabel(appointment.status)}
                              color={getAppointmentStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default PatientDetail;