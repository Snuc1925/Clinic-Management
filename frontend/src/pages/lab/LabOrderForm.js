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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Science as LabIcon,
  Add as AddIcon,
  Edit as EditIcon,
  LocalHospital as TreatmentIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { labService, clinicService, treatmentService } from '../../services/api';

function LabOrderForm() {
  const { clinicId, labOrderId, treatmentId:  urlTreatmentId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!labOrderId;

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
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedLabPartner, setSelectedLabPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

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
      const currentMember = membersResponse.data. find(m => m.userId === storedUser.id);
      setUserRole(currentMember?.role || '');

      // If editing an existing order, load its data
      if (labOrderId) {
        const orderResponse = await labService.getLabOrder(labOrderId);
        const order = orderResponse.data;

        // Find and set selected treatment
        const treatment = treatmentsResponse.data.find(t => t.id === order.treatmentId);
        if (treatment) {
          setSelectedTreatment(treatment);
        }

        // Find and set selected lab partner
        const partner = partnersResponse.data.find(p => p.id === order.labPartnerId);
        if (partner) {
          setSelectedLabPartner(partner);
        }

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
        const treatment = treatmentsResponse.data.find(t => t.id === parseInt(urlTreatmentId));
        if (treatment) {
          setSelectedTreatment(treatment);
        }

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

  const handleTreatmentChange = (event, newValue) => {
    setSelectedTreatment(newValue);
    setFormData({ ...formData, treatmentId: newValue ?  newValue.id : '' });
  };

  const handleLabPartnerChange = (event, newValue) => {
    setSelectedLabPartner(newValue);
    setFormData({ ...formData, labPartnerId: newValue ?  newValue.id : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const submitData = {
        treatmentId: parseInt(formData.treatmentId),
        labPartnerId: parseInt(formData.labPartnerId),
        description: formData. description,
        price: parseFloat(formData.price),
        status: formData.status,
        deliveryDate: formData. deliveryDate || null,
      };

      if (labOrderId) {
        // Update existing order
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
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            {isEdit ? (
              <EditIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            ) : (
              <AddIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            )}
            <Typography variant="h4" component="h1" fontWeight="bold">
              {isEdit ? 'Chỉnh sửa Đơn Labo' : 'Tạo Đơn Labo Mới'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/clinics/${clinicId}/lab-management`)}
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
              
              <Stack spacing={3}>
                
                <Box>
                  <Typography variant="h6" component="h2" gutterBottom color="primary">
                    <LabIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Thông tin Đơn Labo
                  </Typography>
                </Box>

                {/* 1. Điều trị - AUTOCOMPLETE */}
                <Autocomplete
                  fullWidth
                  options={treatments}
                  value={selectedTreatment}
                  onChange={handleTreatmentChange}
                  disabled={!!urlTreatmentId} // Disable if pre-selected from treatment detail
                  getOptionLabel={(option) => {
                    const parts = [];
                    if (option.patientName) parts.push(option.patientName);
                    if (option.description) parts.push(option.description);
                    if (option.date) {
                      const date = new Date(option.date);
                      parts.push(date.toLocaleDateString('vi-VN'));
                    }
                    return parts.join(' - ') || `Điều trị #${option.id}`;
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue. toLowerCase().trim();
                    if (!searchTerm) return options;
                    
                    return options.filter(option => {
                      const patientName = option.patientName?.toLowerCase() || '';
                      const description = option.description?.toLowerCase() || '';
                      const id = option.id?.toString() || '';
                      return patientName.includes(searchTerm) || 
                             description.includes(searchTerm) || 
                             id.includes(searchTerm);
                    });
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems:  'center', gap: 1, py: 1 }}>
                      <TreatmentIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {option.patientName || 'Không rõ bệnh nhân'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description || 'Không có mô tả'}
                          {option.date && ` • ${new Date(option.date).toLocaleDateString('vi-VN')}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {... params}
                      label="Tìm kiếm điều trị *"
                      placeholder="Nhập tên bệnh nhân hoặc mô tả..."
                      required={! selectedTreatment}
                      InputProps={{
                        ... params.InputProps,
                        startAdornment: (
                          <>
                            <TreatmentIcon sx={{ color:  'action.active', mr: 1, ml: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="Không tìm thấy điều trị"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />

                {/* 2. Nhà cung cấp Labo - AUTOCOMPLETE */}
                <Autocomplete
                  fullWidth
                  options={labPartners}
                  value={selectedLabPartner}
                  onChange={handleLabPartnerChange}
                  getOptionLabel={(option) => {
                    const parts = [option.name];
                    if (option.phone) parts.push(option.phone);
                    if (option. email) parts.push(option.email);
                    return parts. join(' - ');
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase().trim();
                    if (!searchTerm) return options;
                    
                    return options.filter(option => {
                      const name = option.name?.toLowerCase() || '';
                      const phone = option.phone?.toLowerCase() || '';
                      const email = option.email?.toLowerCase() || '';
                      return name.includes(searchTerm) || 
                             phone. includes(searchTerm) || 
                             email.includes(searchTerm);
                    });
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                      <BusinessIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.phone && `SĐT: ${option.phone}`}
                          {option.email && ` • ${option.email}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tìm kiếm nhà cung cấp *"
                      placeholder="Nhập tên, SĐT hoặc email..."
                      required={!selectedLabPartner}
                      InputProps={{
                        ...params. InputProps,
                        startAdornment: (
                          <>
                            <BusinessIcon sx={{ color: 'action.active', mr: 1, ml: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="Không tìm thấy nhà cung cấp"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />

                {/* 3. Mô tả sản phẩm */}
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

                {/* 4. Giá tiền */}
                <TextField
                  fullWidth
                  label="Giá *"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  inputProps={{ min:  0, step: 0.01 }}
                  InputProps={{
                    endAdornment: <Typography variant="body2" color="text.secondary">VND</Typography>
                  }}
                />

                {/* 5. Trạng thái */}
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

                {/* 6. Ngày giao hàng */}
                <TextField
                  fullWidth
                  label="Ngày giao hàng"
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: '9999-12-31' }}
                />

              </Stack>
              {/* KẾT THÚC STACK */}

              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate(`/clinics/${clinicId}/lab-management`)}
                  disabled={submitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu.. .' : (isEdit ? 'Cập nhật' : 'Tạo đơn')}
                </Button>
              </Box>

            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default LabOrderForm;