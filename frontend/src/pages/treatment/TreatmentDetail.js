import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Collapse,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocalHospital as TreatmentIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Cancel as CancelIcon,
  Science as LabIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { treatmentService, paymentService, clinicService, labService, inventoryService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

function TreatmentDetail() {
  const { clinicId, treatmentId } = useParams();
  const navigate = useNavigate();
  const [treatment, setTreatment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [inventoryTransactions, setInventoryTransactions] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  const loadTreatmentData = useCallback(async () => {
    try {
      setLoading(true);
      const [treatmentResponse, paymentsResponse, membersResponse, labOrdersResponse, inventoryResponse] = await Promise.all([
        treatmentService.getTreatment(clinicId, treatmentId),
        paymentService.getTreatmentPayments(treatmentId),
        clinicService.getClinicMembers(clinicId),
        labService.getTreatmentLabOrders(treatmentId).catch((err) => {
          console.log('Lab orders not available:', err.message);
          return { data: [] };
        }),
        inventoryService.getTreatmentTransactions(treatmentId).catch((err) => {
          console.log('Inventory transactions not available:', err.message);
          return { data: [] };
        }),
      ]);

      setTreatment(treatmentResponse.data);
      setPayments(paymentsResponse.data);
      setLabOrders(labOrdersResponse.data);
      setInventoryTransactions(inventoryResponse.data);

      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');

      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin điều trị');
    } finally {
      setLoading(false);
    }
  }, [clinicId, treatmentId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadTreatmentData();
  }, [loadTreatmentData, navigate]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await paymentService.addPayment(treatmentId, paymentForm);
      setShowPaymentForm(false);
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: ''
      });
      loadTreatmentData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể thêm thanh toán');
    }
  };

  const handlePaymentFormChange = (e) => {
    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value
    });
  };

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

  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      'cash': 'Tiền mặt',
      'card': 'Thẻ',
      'bank_transfer': 'Chuyển khoản',
      'insurance': 'Bảo hiểm',
      'other': 'Khác'
    };
    return methodMap[method] || method;
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

  if (error && !treatment) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Alert severity="error">{error}</Alert>
      </Layout>
    );
  }

  if (!treatment) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Alert severity="error">Không tìm thấy thông tin điều trị</Alert>
      </Layout>
    );
  }

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <TreatmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Chi tiết Điều trị
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/treatments`)}
            >
              Quay lại danh sách
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/patients/${treatment.patientId}`)}
            >
              Xem bệnh nhân
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Treatment Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom color="primary">
              Thông tin Điều trị
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Bệnh nhân
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {treatment.patientName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Bác sĩ
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {treatment.doctorName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Ngày điều trị
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {treatment.date ? formatDate(treatment.date) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Tổng chi phí
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="info.main">
                  {treatment.totalPayment?.toLocaleString('vi-VN') || '0'} VND
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Đã thanh toán
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="success.main">
                  {treatment.paidAmount?.toLocaleString('vi-VN') || '0'} VND
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Còn nợ
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="medium" 
                  color={treatment.remainingBalance > 0 ? "error.main" : "success.main"}
                >
                  {treatment.remainingBalance?.toLocaleString('vi-VN') || '0'} VND
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái thanh toán
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={getPaymentStatusLabel(treatment.paymentStatus)}
                    color={getPaymentStatusColor(treatment.paymentStatus)}
                    size="small"
                  />
                </Box>
              </Grid>
              {treatment.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Mô tả điều trị
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {treatment.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Lab Orders Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <LabIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2" color="primary">
                  Labo đã đặt
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/clinics/${clinicId}/treatments/${treatmentId}/lab-orders/new`)}
              >
                Tạo đơn mới
              </Button>
            </Box>

            {labOrders.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" py={2}>
                Chưa có đơn labo nào.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nhà cung cấp</strong></TableCell>
                      <TableCell><strong>Sản phẩm</strong></TableCell>
                      <TableCell><strong>Chi phí</strong></TableCell>
                      <TableCell><strong>Trạng thái</strong></TableCell>
                      <TableCell><strong>Ngày giao</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {labOrders.map(order => (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.labPartnerName}</TableCell>
                        <TableCell>{order.description || 'N/A'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium" color="primary">
                            {order.price?.toLocaleString('vi-VN')}₫
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              order.status === 'ORDERED' ? 'Đã đặt' :
                              order.status === 'RECEIVED' ? 'Đã nhận' :
                              order.status === 'INSTALLED' ? 'Đã lắp' : 'Hủy'
                            }
                            size="small"
                            color={
                              order.status === 'INSTALLED' ? 'success' :
                              order.status === 'CANCELED' ? 'error' : 'info'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {order.deliveryDate ? formatDate(order.deliveryDate) : 'Chưa giao'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Inventory Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2" color="primary">
                  Vật tư đã sử dụng
                </Typography>
              </Box>
            </Box>

            {inventoryTransactions.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" py={2}>
                Chưa sử dụng vật tư nào.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Tên vật tư</strong></TableCell>
                      <TableCell><strong>Số lượng</strong></TableCell>
                      <TableCell><strong>Đơn vị</strong></TableCell>
                      <TableCell><strong>Loại</strong></TableCell>
                      <TableCell><strong>Thời gian</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryTransactions.map(transaction => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>{transaction.itemName}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {transaction.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell>{transaction.itemUnit}</TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type === 'EXPORT' ? 'Xuất' : transaction.type}
                            size="small"
                            color={transaction.type === 'EXPORT' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {transaction.timestamp ? formatDate(transaction.timestamp) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2" color="primary">
                  Lịch sử Thanh toán
                </Typography>
              </Box>
              {treatment.remainingBalance > 0 && (
                <Button
                  variant={showPaymentForm ? "outlined" : "contained"}
                  startIcon={showPaymentForm ? <CancelIcon /> : <AddIcon />}
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  color={showPaymentForm ? "secondary" : "primary"}
                >
                  {showPaymentForm ? 'Hủy' : 'Thêm thanh toán'}
                </Button>
              )}
            </Box>

            <Collapse in={showPaymentForm}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thêm thanh toán mới
                  </Typography>
                  <Box component="form" onSubmit={handleAddPayment}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Số tiền *"
                          name="amount"
                          type="number"
                          value={paymentForm.amount}
                          onChange={handlePaymentFormChange}
                          inputProps={{
                            step: "1",
                            min: "1",
                            max: Math.max(0, treatment.remainingBalance)
                          }}
                          required
                          disabled={treatment.remainingBalance <= 0}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Ngày thanh toán *"
                          name="paymentDate"
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={handlePaymentFormChange}
                          InputLabelProps={{ shrink: true }}
                          required
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Phương thức thanh toán</InputLabel>
                          <Select
                            name="paymentMethod"
                            value={paymentForm.paymentMethod}
                            onChange={handlePaymentFormChange}
                            label="Phương thức thanh toán"
                          >
                            <MenuItem value="cash">Tiền mặt</MenuItem>
                            <MenuItem value="card">Thẻ</MenuItem>
                            <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                            <MenuItem value="insurance">Bảo hiểm</MenuItem>
                            <MenuItem value="other">Khác</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Ghi chú"
                          name="notes"
                          value={paymentForm.notes}
                          onChange={handlePaymentFormChange}
                          placeholder="Ghi chú về thanh toán"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Box mt={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                      >
                        Thêm thanh toán
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Collapse>

            <Divider sx={{ my: 2 }} />

            {payments.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                Chưa có thanh toán nào được ghi nhận.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Ngày</strong></TableCell>
                      <TableCell><strong>Số tiền</strong></TableCell>
                      <TableCell><strong>Phương thức</strong></TableCell>
                      <TableCell><strong>Ghi chú</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map(payment => (
                      <TableRow key={payment.id} hover>
                        <TableCell>
                          {payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            {payment.amount?.toLocaleString('vi-VN') || '0'} VND
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentMethodLabel(payment.paymentMethod)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default TreatmentDetail;