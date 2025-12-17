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
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as LabIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { labService, clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lab-tabpanel-${index}`}
      aria-labelledby={`lab-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function LabManagement() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [labPartners, setLabPartners] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userRole, setUserRole] = useState('');
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const theme = useTheme();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [partnersResponse, ordersResponse, membersResponse] = await Promise.all([
        labService.getClinicLabPartners(clinicId),
        labService.getClinicLabOrders(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);
      
      setLabPartners(partnersResponse.data);
      setLabOrders(ordersResponse.data);
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [loadData, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Lab Partner functions
  const handleOpenPartnerDialog = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setPartnerFormData({
        name: partner.name,
        phone: partner.phone,
        address: partner.address,
      });
    } else {
      setEditingPartner(null);
      setPartnerFormData({ name: '', phone: '', address: '' });
    }
    setShowPartnerDialog(true);
  };

  const handleClosePartnerDialog = () => {
    setShowPartnerDialog(false);
    setEditingPartner(null);
    setPartnerFormData({ name: '', phone: '', address: '' });
  };

  const handlePartnerSubmit = async () => {
    try {
      if (editingPartner) {
        await labService.updateLabPartner(clinicId, editingPartner.id, partnerFormData);
      } else {
        await labService.createLabPartner(clinicId, partnerFormData);
      }
      handleClosePartnerDialog();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu nhà cung cấp labo');
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp labo này?')) {
      try {
        await labService.deleteLabPartner(clinicId, partnerId);
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa nhà cung cấp labo');
      }
    }
  };

  // Lab Order functions
  const handleEditOrder = (orderId) => {
    navigate(`/clinics/${clinicId}/lab-orders/${orderId}/edit`);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'ORDERED': 'Đã đặt',
      'RECEIVED': 'Đã nhận',
      'INSTALLED': 'Đã lắp',
      'CANCELED': 'Hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'ORDERED': 'info',
      'RECEIVED': 'warning',
      'INSTALLED': 'success',
      'CANCELED': 'error'
    };
    return colorMap[status] || 'default';
  };

  // Filtering
  const filteredPartners = labPartners.filter(partner =>
    partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = labOrders.filter(order => {
    const matchesSearch = 
      order.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.labPartnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
                  Quản lý Labo
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý các đơn đặt labo và nhà cung cấp
                </Typography>
              </Box>
            </Box>
            {tabValue === 0 && (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/clinics/${clinicId}/lab-orders/new`)}
                sx={{ borderRadius: 2 }}
              >
                Tạo đơn mới
              </Button>
            )}
            {tabValue === 1 && (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => handleOpenPartnerDialog()}
                sx={{ borderRadius: 2 }}
              >
                Thêm nhà cung cấp
              </Button>
            )}
          </Box>
        </Paper>

        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Tabs */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 3,
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                minHeight: 64,
              },
            }}
          >
            <Tab label="Phiếu đặt Labo" />
            <Tab label="Nhà cung cấp Labo" />
          </Tabs>
        </Card>

        {/* Search and Filter */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <Box sx={{ p: 3 }}>
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                placeholder={tabValue === 0 ? "Tìm kiếm theo bệnh nhân, nhà cung cấp, mô tả..." : "Tìm kiếm theo tên, số điện thoại..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              {tabValue === 0 && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="ORDERED">Đã đặt</MenuItem>
                    <MenuItem value="RECEIVED">Đã nhận</MenuItem>
                    <MenuItem value="INSTALLED">Đã lắp</MenuItem>
                    <MenuItem value="CANCELED">Hủy</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>
        </Card>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {/* Lab Orders List */}
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                <LabIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Danh sách phiếu đặt labo ({filteredOrders.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Bệnh nhân</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Nhà cung cấp</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Giá</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Ngày giao</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box textAlign="center">
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              mx: 'auto',
                              mb: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }}
                          >
                            <LabIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy đơn nào' : 'Chưa có đơn nào'}
                          </Typography>
                          {!searchTerm && statusFilter === 'all' && (
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => navigate(`/clinics/${clinicId}/lab-orders/new`)}
                              sx={{ borderRadius: 2, mt: 1 }}
                            >
                              Tạo đơn đầu tiên
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow 
                        key={order.id} 
                        hover
                        sx={{ 
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                          cursor: 'pointer'
                        }}
                        onClick={() => handleEditOrder(order.id)}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {order.patientName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2, maxWidth: 200 }}>
                          <Typography variant="body2" sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {order.description || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2">
                            {order.labPartnerName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {order.price?.toLocaleString('vi-VN')}₫
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2">
                            {order.deliveryDate ? formatDate(order.deliveryDate) : 'Chưa giao'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOrder(order.id);
                              }}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                              }}
                            >
                              <EditIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Lab Partners List */}
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                <LabIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Danh sách nhà cung cấp ({filteredPartners.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên nhà cung cấp</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Số điện thoại</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Địa chỉ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Box textAlign="center">
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              mx: 'auto',
                              mb: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                            }}
                          >
                            <LabIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm ? 'Không tìm thấy nhà cung cấp nào' : 'Chưa có nhà cung cấp nào'}
                          </Typography>
                          {!searchTerm && (
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenPartnerDialog()}
                              sx={{ borderRadius: 2, mt: 1 }}
                            >
                              Thêm nhà cung cấp đầu tiên
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPartners.map((partner) => (
                      <TableRow 
                        key={partner.id} 
                        hover
                        sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {partner.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{partner.phone}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{partner.address || 'N/A'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPartnerDialog(partner)}
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                                }}
                              >
                                <EditIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePartner(partner.id)}
                                sx={{
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) },
                                }}
                              >
                                <DeleteIcon sx={{ color: 'error.main', fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </TabPanel>

        {/* Partner Dialog */}
        <Dialog open={showPartnerDialog} onClose={handleClosePartnerDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              {editingPartner ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp Mới'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên nhà cung cấp"
                  value={partnerFormData.name}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={partnerFormData.phone}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={partnerFormData.address}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, address: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClosePartnerDialog}>Hủy</Button>
            <Button variant="contained" onClick={handlePartnerSubmit}>
              {editingPartner ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default LabManagement;
