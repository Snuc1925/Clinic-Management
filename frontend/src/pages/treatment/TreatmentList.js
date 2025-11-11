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
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Avatar,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalHospital as TreatmentIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Payments as PaymentsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { treatmentService, clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

function TreatmentList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [userRole, setUserRole] = useState('');
  const theme = useTheme();

  const loadTreatments = useCallback(async () => {
    try {
      setLoading(true);
      const [treatmentsResponse, membersResponse] = await Promise.all([
        treatmentService.getClinicTreatments(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);
      setTreatments(treatmentsResponse.data);
      
      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách điều trị');
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
    loadTreatments();
  }, [loadTreatments, navigate]);

  const handleDelete = async (treatmentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa điều trị này?')) {
      try {
        await treatmentService.deleteTreatment(clinicId, treatmentId);
        loadTreatments();
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa điều trị');
      }
    }
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

  const getTreatmentIcon = (status) => {
    const iconMap = {
      'paid': <PaymentsIcon />,
      'partial': <MoneyIcon />,
      'unpaid': <AssessmentIcon />
    };
    return iconMap[status] || <MedicalIcon />;
  };

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = 
      treatment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || treatment.paymentStatus === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const totalRevenue = treatments.reduce((sum, t) => sum + (t.totalPayment || 0), 0);
  const paidRevenue = treatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0);
  const pendingRevenue = treatments.reduce((sum, t) => sum + (t.remainingBalance || 0), 0);

  if (loading) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Đang tải danh sách điều trị...
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        {/* Enhanced Header */}
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
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
              >
                <TreatmentIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Quản lý Điều trị
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Theo dõi quá trình điều trị và tình trạng thanh toán của bệnh nhân
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật: {new Date().toLocaleDateString('vi-VN')} lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/treatments/new`)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Thêm điều trị
            </Button>
          </Box>
        </Paper>

        {/* Enhanced Error Alert */}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* Statistics Cards */}
        {/* <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={300}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                    }}
                  >
                    <MedicalIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {treatments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng điều trị
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={400}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'success.main',
                    }}
                  >
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {totalRevenue.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng doanh thu (VND)
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={500}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'info.main',
                    }}
                  >
                    <PaymentsIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {paidRevenue.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã thu (VND)
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={600}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'warning.main',
                    }}
                  >
                    <AssessmentIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {pendingRevenue.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Còn nợ (VND)
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid> */}

        {/* Enhanced Search and Filter Card */}
        <Fade in timeout={700}>
          <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tìm kiếm & Lọc điều trị
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tìm kiếm theo bệnh nhân, bác sĩ hoặc mô tả điều trị
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm theo bệnh nhân, bác sĩ hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                      },
                    },
                  }}
                />
                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel>Trạng thái thanh toán</InputLabel>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Trạng thái thanh toán"
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterIcon sx={{ color: 'text.secondary', ml: 1 }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'secondary.main',
                      },
                    }}
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    <MenuItem value="paid">Đã thanh toán</MenuItem>
                    <MenuItem value="partial">Thanh toán một phần</MenuItem>
                    <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {(searchTerm || filter !== 'all') && (
                <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                  {searchTerm && (
                    <Chip
                      label={`Tìm kiếm: "${searchTerm}"`}
                      onDelete={() => setSearchTerm('')}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {filter !== 'all' && (
                    <Chip
                      label={`Lọc: ${getPaymentStatusLabel(filter)}`}
                      onDelete={() => setFilter('all')}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                    Tìm thấy <strong>{filteredTreatments.length}</strong> kết quả
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Enhanced Treatment Table */}
        <Fade in timeout={800}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                <TreatmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Danh sách điều trị ({filteredTreatments.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Thông tin điều trị</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Bệnh nhân</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Bác sĩ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Chi phí & Thanh toán</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTreatments.length === 0 ? (
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
                            <TreatmentIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm || filter !== 'all' ? 'Không tìm thấy điều trị nào' : 'Chưa có điều trị nào'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {searchTerm || filter !== 'all'
                              ? 'Không có kết quả nào phù hợp với tiêu chí tìm kiếm'
                              : 'Hãy thêm điều trị đầu tiên để bắt đầu quản lý'
                            }
                          </Typography>
                          {!searchTerm && filter === 'all' && (
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => navigate(`/clinics/${clinicId}/treatments/new`)}
                              sx={{ borderRadius: 2, mt: 1 }}
                            >
                              Thêm điều trị đầu tiên
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTreatments.map((treatment, index) => (
                      <TableRow 
                        key={treatment.id} 
                        hover
                        sx={{
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease-in-out',
                          },
                          animation: `fadeInUp 0.5s ease-in-out ${index * 0.1}s both`,
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getPaymentStatusColor(treatment.paymentStatus) + '.main',
                                width: 40,
                                height: 40,
                              }}
                            >
                              {getTreatmentIcon(treatment.paymentStatus)}
                            </Avatar>
                            <Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography fontWeight="bold" variant="body2">
                                  {treatment.date ? formatDate(treatment.date) : 'N/A'}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                ID: {treatment.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight="medium">
                              {treatment.patientName || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <MedicalIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {treatment.doctorName || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, maxWidth: 200 }}>
                          <Typography variant="body2" sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {treatment.description || 'Không có mô tả'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Stack spacing={0.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <MoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">Tổng:</Typography>
                              <Typography variant="body2" fontWeight="bold" color="info.main">
                                {treatment.totalPayment?.toLocaleString('vi-VN') || '0'}₫
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PaymentsIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">Đã trả:</Typography>
                              <Typography variant="body2" color="success.main" fontWeight="medium">
                                {treatment.paidAmount?.toLocaleString('vi-VN') || '0'}₫
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <AssessmentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">Còn nợ:</Typography>
                              <Typography variant="body2" color="error.main" fontWeight="medium">
                                {treatment.remainingBalance?.toLocaleString('vi-VN') || '0'}₫
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={getPaymentStatusLabel(treatment.paymentStatus)}
                            color={getPaymentStatusColor(treatment.paymentStatus)}
                            size="small"
                            icon={getTreatmentIcon(treatment.paymentStatus)}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/clinics/${clinicId}/treatments/${treatment.id}`)}
                                sx={{
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.info.main, 0.2),
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <ViewIcon sx={{ color: 'info.main', fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/clinics/${clinicId}/treatments/${treatment.id}/edit`)}
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                <EditIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(treatment.id)}
                                sx={{
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out',
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
        </Fade>
      </Box>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}

export default TreatmentList;