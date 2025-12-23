import React, { useState, useEffect } from 'react';
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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Science as LabIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { labService, clinicService, treatmentService } from '../../services/api';

function LabOrderForm() {
  const { clinicId, labOrderId, treatmentId: urlTreatmentId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    treatmentId: '',
    labPartnerId: '',
    description: '',
    price: '',
    status: 'ORDERED',
    deliveryDate: '',
  });
  const [labPartners, setLabPartners] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, labOrderId, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partnersResponse, treatmentsResponse, membersResponse] = await Promise.all([
        labService.getClinicLabPartners(clinicId),
        treatmentService.getClinicTreatments(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);

      setLabPartners(partnersResponse.data);
      setTreatments(treatmentsResponse.data);

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.userId === storedUser.id);
      setUserRole(currentMember?.role || '');

      // If editing an existing order, load its data
      if (labOrderId) {
        const orderResponse = await labService.getLabOrder(labOrderId);
        const order = orderResponse.data;
        setFormData({
          treatmentId: order.treatmentId || '',
          labPartnerId: order.labPartnerId || '',
          description: order.description || '',
          price: order.price || '',
          status: order.status || 'ORDERED',
          deliveryDate: order.deliveryDate || '',
        });
      } else if (urlTreatmentId) {
        // If creating a new order from treatment detail, pre-fill treatment
        setFormData(prev => ({
          ...prev,
          treatmentId: urlTreatmentId,
        }));
      }

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = {
        treatmentId: parseInt(formData.treatmentId),
        labPartnerId: parseInt(formData.labPartnerId),
        description: formData.description,
        price: parseFloat(formData.price),
        status: formData.status,
        deliveryDate: formData.deliveryDate || null,
      };

      if (labOrderId) {
        // Update existing order with all fields in one call
        await labService.updateLabOrder(clinicId, labOrderId, submitData);
      } else {
        // Create new order
        await labService.createLabOrder(clinicId, submitData);
      }

      navigate(`/clinics/${clinicId}/lab-management`);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu đơn labo');
    } finally {
      setSubmitting(false);
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
                }}
              >
                <LabIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  {labOrderId ? 'Chỉnh sửa Đơn Labo' : 'Tạo Đơn Labo Mới'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {labOrderId ? 'Cập nhật thông tin đơn đặt labo' : 'Thêm đơn đặt labo mới'}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/lab-management`)}
              sx={{ borderRadius: 2 }}
            >
              Quay lại
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Điều trị</InputLabel>
                    <Select
                      name="treatmentId"
                      value={formData.treatmentId}
                      onChange={handleChange}
                      label="Điều trị"
                      disabled={!!urlTreatmentId}
                    >
                      {treatments.map((treatment) => (
                        <MenuItem key={treatment.id} value={treatment.id}>
                          {treatment.patientName} - {treatment.description || 'N/A'} ({new Date(treatment.date).toLocaleDateString('vi-VN')})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Nhà cung cấp Labo</InputLabel>
                    <Select
                      name="labPartnerId"
                      value={formData.labPartnerId}
                      onChange={handleChange}
                      label="Nhà cung cấp Labo"
                    >
                      {labPartners.map((partner) => (
                        <MenuItem key={partner.id} value={partner.id}>
                          {partner.name} - {partner.phone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Sản phẩm / Mô tả"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Mô tả chi tiết về sản phẩm/dịch vụ labo..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giá"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Trạng thái"
                    >
                      <MenuItem value="ORDERED">Đã đặt</MenuItem>
                      <MenuItem value="RECEIVED">Đã nhận</MenuItem>
                      <MenuItem value="INSTALLED">Đã lắp</MenuItem>
                      <MenuItem value="CANCELED">Hủy</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ngày giao hàng"
                    name="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/clinics/${clinicId}/lab-management`)}
                      disabled={submitting}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={submitting}
                    >
                      {submitting ? 'Đang lưu...' : (labOrderId ? 'Cập nhật' : 'Tạo đơn')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default LabOrderForm;
