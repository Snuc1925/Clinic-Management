import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
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
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Science as LabIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { labService, clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

function LabOrderList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userRole, setUserRole] = useState('');
  const theme = useTheme();

  const loadLabOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersResponse, membersResponse] = await Promise.all([
        labService.getClinicLabOrders(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);
      setLabOrders(ordersResponse.data);
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn xét nghiệm');
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
    loadLabOrders();
  }, [loadLabOrders, navigate]);

  const getStatusLabel = (status) => {
    const statusMap = {
      'ORDERED': 'Đã đặt',
      'RECEIVED': 'Đã nhận',
      'INSTALLED': 'Đã lắp',
      'CANCELED': 'Đã hủy'
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
                  Đơn Xét nghiệm
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý các đơn đặt xét nghiệm, nha khoa
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}

        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <Box sx={{ p: 3 }}>
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo bệnh nhân, đối tác, mô tả..."
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
                  <MenuItem value="CANCELED">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Card>

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
              Danh sách đơn xét nghiệm ({filteredOrders.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Bệnh nhân</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đối tác</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Chi phí</TableCell>
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      hover
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {order.patientName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2">
                          {order.labPartnerName}
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
                        <Tooltip title="Xem chi tiết điều trị">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/clinics/${clinicId}/treatments/${order.treatmentId}`)}
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) },
                            }}
                          >
                            <ViewIcon sx={{ color: 'info.main', fontSize: 18 }} />
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
      </Box>
    </Layout>
  );
}

export default LabOrderList;
