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
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalHospital as TreatmentIcon,
  Add as AddIcon,
  Event as AppointmentIcon,
  Science as LabIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';

import { treatmentService, patientService, appointmentService, clinicService, labOrderService, labPartnerService } from '../../services/api';

function TreatmentForm() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState([]);
  const [labPartners, setLabPartners] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected patient object for Autocomplete
  const [selectedPatient, setSelectedPatient] = useState(null);

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

  const [labOrders, setLabOrders] = useState([]);
  const [openLabDialog, setOpenLabDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [currentLabOrder, setCurrentLabOrder] = useState({
    labPartnerId: '',
    price: '',
    description: '',
    deliveryDate:  ''
  });

  const loadInitialData = useCallback(async () => {
    try {
      const [patientsRes, membersRes, labPartnersRes] = await Promise.all([
        patientService.getClinicPatients(clinicId),
        clinicService.getClinicMembers(clinicId),
        labPartnerService.getClinicLabPartners(clinicId)
      ]);

      setPatients(patientsRes. data);
      if(labPartnersRes.data) setLabPartners(labPartnersRes.data);

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersRes.data.find(m => m.userId === storedUser.id);
      setUserRole(currentMember?.role || '');

      // Set selected patient if preselected
      if (preselectedPatientId) {
        const preselected = patientsRes.data. find(p => p.id === parseInt(preselectedPatientId));
        if (preselected) {
          setSelectedPatient(preselected);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu ban đầu.');
    }
  }, [clinicId, preselectedPatientId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (! token) {
      navigate('/login');
      return;
    }
    loadInitialData();
  }, [loadInitialData, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientChange = (event, newValue) => {
    setSelectedPatient(newValue);
    setFormData({ ...formData, patientId: newValue ?  newValue.id : '' });
  };

  const handleAppointmentChange = (e) => {
    setAppointmentData({ ...appointmentData, [e.target.name]: e.target.value });
  };

  const handleOpenLabDialog = () => {
    if (! formData.patientId) {
      alert("Vui lòng chọn Bệnh nhân ở phần thông tin điều trị trước khi thêm chỉ định Lab.");
      return;
    }
    setEditingIndex(-1);
    setCurrentLabOrder({ labPartnerId: '', price: '', description: '', deliveryDate: '' });
    setOpenLabDialog(true);
  };

  const handleEditLabOrder = (index) => {
    setEditingIndex(index);
    setCurrentLabOrder(labOrders[index]);
    setOpenLabDialog(true);
  };

  const handleDeleteLabOrder = (index) => {
    const newOrders = [... labOrders];
    newOrders.splice(index, 1);
    setLabOrders(newOrders);
  };

  const handleLabOrderChange = (e) => {
    setCurrentLabOrder({ ...currentLabOrder, [e.target.name]:  e.target.value });
  };

  const handleSaveLabOrderLocal = () => {
    if (!currentLabOrder.labPartnerId || !currentLabOrder.price) {
      alert("Vui lòng chọn đối tác Lab và nhập giá tiền.");
      return;
    }
    if (editingIndex >= 0) {
      const newOrders = [...labOrders];
      newOrders[editingIndex] = currentLabOrder;
      setLabOrders(newOrders);
    } else {
      setLabOrders([...labOrders, currentLabOrder]);
    }
    setOpenLabDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const treatmentResponse = await treatmentService.createTreatment(clinicId, formData);
      const newTreatmentId = treatmentResponse.data. id;

      if (showAppointment) {
        const appointmentDate = calculateAppointmentDate();
        await appointmentService.createAppointment(clinicId, {
          patientId: formData.patientId,
          appointmentDate:  appointmentDate,
          description: appointmentData.description || 'Lịch hẹn tái khám',
          status: 'scheduled'
        });
      }

      if (labOrders.length > 0) {
        const labOrderPromises = labOrders.map(order => {
          return labOrderService.createLabOrder(clinicId, {
            treatmentId: newTreatmentId,
            labPartnerId: order.labPartnerId,
            price: order. price,
            description: order. description,
            deliveryDate:  order.deliveryDate || null
          });
        });
        await Promise.all(labOrderPromises);
      }

      navigate(`/clinics/${clinicId}/treatments/${newTreatmentId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
      setLoading(false);
    }
  };

  const calculateAppointmentDate = () => {
    const baseDate = new Date(formData.date);
    if (appointmentData.interval === 'custom') return new Date(appointmentData.customDate).toISOString();
    const intervals = { '1week': 7, '2weeks': 14, '1month': 30, '3months': 90, '6months': 180 };
    baseDate.setDate(baseDate. getDate() + intervals[appointmentData.interval]);
    return baseDate.toISOString();
  };

  if (loading && patients.length === 0) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>
      </Layout>
    );
  }

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <AddIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">Tạo Điều trị mới</Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/clinics/${clinicId}/treatments`)}>
            Quay lại danh sách
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              
              <Stack spacing={3}>
                
                <Box>
                  <Typography variant="h6" component="h2" gutterBottom color="primary">
                    <TreatmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Thông tin Điều trị
                  </Typography>
                </Box>

                {/* AUTOCOMPLETE FOR PATIENT SEARCH */}
                <Autocomplete
                  fullWidth
                  options={patients}
                  value={selectedPatient}
                  onChange={handlePatientChange}
                  getOptionLabel={(option) => {
                    const parts = [option.fullName];
                    if (option.phone) parts.push(option.phone);
                    if (option.dateOfBirth) {
                      const dob = new Date(option.dateOfBirth);
                      parts.push(`${dob.getDate()}/${dob.getMonth() + 1}/${dob.getFullYear()}`);
                    }
                    return parts.join(' - ');
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase().trim();
                    if (!searchTerm) return options;
                    
                    return options.filter(option => {
                      const fullName = option.fullName?. toLowerCase() || '';
                      const phone = option.phone?.toLowerCase() || '';
                      return fullName.includes(searchTerm) || phone.includes(searchTerm);
                    });
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                      <PersonIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {option.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.phone && `SĐT: ${option.phone}`}
                          {option.dateOfBirth && ` • Sinh:  ${new Date(option.dateOfBirth).toLocaleDateString('vi-VN')}`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {... params}
                      label="Tìm kiếm bệnh nhân *"
                      placeholder="Nhập tên hoặc số điện thoại..."
                      required={! selectedPatient}
                      InputProps={{
                        ... params.InputProps,
                        startAdornment: (
                          <>
                            <PersonIcon sx={{ color: 'action.active', mr: 1, ml: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="Không tìm thấy bệnh nhân"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />

                <TextField 
                  fullWidth 
                  label="Ngày điều trị *" 
                  name="date" 
                  type="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  InputLabelProps={{ shrink: true }} 
                  inputProps={{ max: '9999-12-31' }} 
                  required 
                />

                <TextField 
                  fullWidth 
                  label="Tổng chi phí điều trị *" 
                  name="totalPayment" 
                  type="number" 
                  value={formData. totalPayment} 
                  onChange={handleChange} 
                  inputProps={{ step: "1", min: "0" }} 
                  InputProps={{ endAdornment: <Typography variant="body2" color="text.secondary">VND</Typography> }} 
                  required 
                />

                <TextField 
                  fullWidth 
                  label="Mô tả điều trị" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  multiline 
                  rows={4} 
                  placeholder="Mô tả quy trình, thuốc..." 
                />

                <Divider />

                <Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AppointmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2" color="primary">Lịch hẹn tái khám</Typography>
                  </Box>
                  <FormControlLabel 
                    control={<Checkbox checked={showAppointment} onChange={(e) => setShowAppointment(e.target.checked)} color="primary" />} 
                    label="Lên lịch hẹn tái khám" 
                  />
                </Box>

                <Collapse in={showAppointment}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Khoảng thời gian</InputLabel>
                        <Select name="interval" value={appointmentData.interval} onChange={handleAppointmentChange} label="Khoảng thời gian">
                          <MenuItem value="1week">1 Tuần</MenuItem>
                          <MenuItem value="2weeks">2 Tuần</MenuItem>
                          <MenuItem value="1month">1 Tháng</MenuItem>
                          <MenuItem value="3months">3 Tháng</MenuItem>
                          <MenuItem value="6months">6 Tháng</MenuItem>
                          <MenuItem value="custom">Tùy chỉnh ngày</MenuItem>
                        </Select>
                      </FormControl>

                      {appointmentData.interval === 'custom' && (
                        <TextField 
                          fullWidth 
                          label="Ngày hẹn tùy chỉnh" 
                          name="customDate" 
                          type="datetime-local" 
                          value={appointmentData.customDate} 
                          onChange={handleAppointmentChange} 
                          InputLabelProps={{ shrink: true }} 
                          inputProps={{ max: '9999-12-31T23:59' }} 
                          size="small" 
                        />
                      )}
                      
                      <TextField fullWidth label="Mô tả lịch hẹn" name="description" value={appointmentData.description} onChange={handleAppointmentChange} placeholder="Ví dụ: Kiểm tra tái khám" size="small" />
                    </Stack>
                  </Card>
                </Collapse>

                <Divider />

                <Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <LabIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="h6" component="h2" color="secondary. main">Tạo đơn Labo mới</Typography>
                    </Box>
                    <Button variant="outlined" color="secondary" startIcon={<AddIcon />} onClick={handleOpenLabDialog}>
                      Tạo đơn
                    </Button>
                  </Box>

                  {labOrders.length > 0 ?  (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Nhà cung cấp</TableCell>
                            <TableCell>Mô tả/Sản phẩm</TableCell>
                            <TableCell align="right">Chi phí (VND)</TableCell>
                            <TableCell align="center">Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {labOrders.map((order, index) => {
                            const partner = labPartners.find(lp => lp.id === order.labPartnerId);
                            return (
                              <TableRow key={index}>
                                <TableCell>{partner ?  partner.name : 'Unknown Partner'}</TableCell>
                                <TableCell>{order.description}</TableCell>
                                <TableCell align="right">{Number(order.price).toLocaleString()}</TableCell>
                                <TableCell align="center">
                                  <IconButton size="small" color="primary" onClick={() => handleEditLabOrder(index)}><EditIcon /></IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDeleteLabOrder(index)}><DeleteIcon /></IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">Chưa có chỉ định xét nghiệm nào.</Typography>
                  )}
                </Box>

              </Stack>
              {/* --- KẾT THÚC STACK --- */}

              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate(`/clinics/${clinicId}/treatments`)} disabled={loading}>
                  Hủy bỏ
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Tạo điều trị'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Dialog open={openLabDialog} onClose={() => setOpenLabDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingIndex >= 0 ?  'Cập nhật đơn Labo' : 'Thêm đơn Labo mới'}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Bệnh nhân"
                value={selectedPatient?. fullName || ''}
                disabled
                variant="filled"
              />

              <FormControl fullWidth>
                <InputLabel>Nhà cung cấp *</InputLabel>
                <Select name="labPartnerId" value={currentLabOrder. labPartnerId} onChange={handleLabOrderChange} label="Đối tác Lab *">
                  {labPartners.map(lp => (
                    <MenuItem key={lp.id} value={lp.id}>{lp.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField 
                fullWidth 
                label="Chi phí *" 
                name="price" 
                type="number" 
                value={currentLabOrder.price} 
                onChange={handleLabOrderChange} 
                inputProps={{ min: 0 }} 
                InputProps={{ endAdornment: <Typography variant="caption">VND</Typography> }} 
              />

              <TextField 
                fullWidth 
                label="Ngày giao hàng" 
                name="deliveryDate" 
                type="date" 
                value={currentLabOrder.deliveryDate || ''} 
                onChange={handleLabOrderChange} 
                InputLabelProps={{ shrink: true }} 
                inputProps={{ max: '9999-12-31' }} 
              />

              <TextField fullWidth label="Mô tả/Sản phẩm" name="description" multiline rows={3} value={currentLabOrder.description} onChange={handleLabOrderChange} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLabDialog(false)}>Hủy</Button>
            <Button onClick={handleSaveLabOrderLocal} variant="contained" color="secondary">
              {editingIndex >= 0 ? 'Cập nhật' : 'Thêm vào danh sách'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Layout>
  );
}

export default TreatmentForm;