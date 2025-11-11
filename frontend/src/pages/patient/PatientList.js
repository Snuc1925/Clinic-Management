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
  Grid,
  Avatar,
  Chip,
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
  People as PeopleIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { patientService, clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

function PatientList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const theme = useTheme();

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const [patientsResponse, membersResponse] = await Promise.all([
        patientService.getClinicPatients(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);
      setPatients(patientsResponse.data);
      
      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách bệnh nhân');
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
    loadPatients();
  }, [loadPatients, navigate]);

  const handleDelete = async (patientId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) {
      try {
        await patientService.deletePatient(clinicId, patientId);
        loadPatients();
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa bệnh nhân');
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const getPatientInitials = (name) => {
    return name
      .split(' ')
      .slice(-2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  const getPatientAvatarColor = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ];
    return colors[index % colors.length];
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  if (loading) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Đang tải danh sách bệnh nhân...
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
                <PeopleIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Quản lý Bệnh nhân
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý thông tin và theo dõi tình trạng sức khỏe bệnh nhân
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
              onClick={() => navigate(`/clinics/${clinicId}/patients/new`)}
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
              Thêm bệnh nhân
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    <GroupIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {patients.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng bệnh nhân
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
                    <PersonAddIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {patients.filter(p => {
                      const createdDate = new Date(p.createdAt);
                      const today = new Date();
                      const daysDiff = (today - createdDate) / (1000 * 60 * 60 * 24);
                      return daysDiff <= 30;
                    }).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mới trong tháng
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          {/* <Grid item xs={12} sm={6} md={3}>
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
                    <CalendarIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {Math.round(patients.filter(p => p.dateOfBirth).reduce((acc, p) => acc + calculateAge(p.dateOfBirth), 0) / patients.filter(p => p.dateOfBirth).length) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tuổi trung bình
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
                    <SearchIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {filteredPatients.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kết quả tìm kiếm
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid> */}
        </Grid>

        {/* Enhanced Search Card */}
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
                Tìm kiếm bệnh nhân
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tìm kiếm theo họ tên hoặc số điện thoại
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <TextField
                fullWidth
                placeholder="Nhập tên bệnh nhân hoặc số điện thoại..."
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
              {searchTerm && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tìm thấy <strong>{filteredPatients.length}</strong> kết quả cho "{searchTerm}"
                </Typography>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Enhanced Patient Table */}
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
                <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Danh sách bệnh nhân ({filteredPatients.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Thông tin bệnh nhân</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Liên hệ</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Ngày sinh & Tuổi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Địa chỉ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
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
                            <PeopleIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm ? 'Không tìm thấy bệnh nhân nào' : 'Chưa có bệnh nhân nào'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {searchTerm 
                              ? `Không có kết quả nào phù hợp với "${searchTerm}"`
                              : 'Hãy thêm bệnh nhân đầu tiên để bắt đầu quản lý'
                            }
                          </Typography>
                          {!searchTerm && (
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => navigate(`/clinics/${clinicId}/patients/new`)}
                              sx={{ borderRadius: 2, mt: 1 }}
                            >
                              Thêm bệnh nhân đầu tiên
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient, index) => (
                      <TableRow 
                        key={patient.id} 
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
                                bgcolor: getPatientAvatarColor(index),
                                fontWeight: 'bold',
                              }}
                            >
                              {getPatientInitials(patient.fullName)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="bold" variant="body1">
                                {patient.fullName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {patient.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {patient.phone || 'Chưa có'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Chưa có'}
                              </Typography>
                            </Box>
                            {patient.dateOfBirth && (
                              <Chip
                                label={`${calculateAge(patient.dateOfBirth)} tuổi`}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                              {patient.address || 'Chưa có'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/clinics/${clinicId}/patients/${patient.id}`)}
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
                                onClick={() => navigate(`/clinics/${clinicId}/patients/${patient.id}/edit`)}
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
                                onClick={() => handleDelete(patient.id)}
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

export default PatientList;