import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

function ClinicList() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchClinics();
  }, [navigate]);

  const fetchClinics = async () => {
    try {
      const response = await clinicService.getUserClinics();
      setClinics(response.data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách phòng khám');
      setLoading(false);
    }
  };

  const handleManageClinic = (clinicId) => {
    navigate(`/clinics/${clinicId}/manage`);
  };

  const handleCreateClinic = () => {
    navigate('/clinics/create');
  };

  const handleJoinClinic = () => {
    navigate('/clinics/join');
  };

  const getRoleColor = (role) => {
    return role === 'owner' ? 'primary' : 'info';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleText = (role) => {
    return role === 'owner' ? 'Chủ sở hữu' : 'Thành viên';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'Đã chấp nhận';
      case 'pending':
        return 'Đang chờ duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const getClinicIcon = (role) => {
    return role === 'owner' ? <StarIcon /> : <PeopleIcon />;
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Đang tải phòng khám...
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
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
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Phòng khám của tôi
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý và theo dõi tất cả phòng khám bạn sở hữu hoặc tham gia
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <TimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreateClinic}
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
                Tạo phòng khám mới
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<GroupAddIcon />}
                onClick={handleJoinClinic}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Tham gia phòng khám
              </Button>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {clinics.length === 0 ? (
          <Zoom in timeout={500}>
            <Card
              sx={{
                textAlign: 'center',
                py: 8,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.grey[100], 0.4)} 100%)`,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <CardContent>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                  Chưa có phòng khám nào
                </Typography>
                <Typography color="text.secondary" paragraph fontSize="1.1rem" sx={{ maxWidth: 500, mx: 'auto' }}>
                  Bạn chưa tạo hoặc tham gia phòng khám nào. Hãy bắt đầu bằng cách tạo mới hoặc tham gia một phòng khám hiện có.
                </Typography>
                <Box display="flex" gap={2} justifyContent="center" mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClinic}
                    size="large"
                    sx={{ borderRadius: 2 }}
                  >
                    Tạo phòng khám đầu tiên
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GroupAddIcon />}
                    onClick={handleJoinClinic}
                    size="large"
                    sx={{ borderRadius: 2 }}
                  >
                    Tham gia ngay
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        ) : (
          <>
            {/* Stats Summary */}
            <Paper
              elevation={1}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {clinics.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng số phòng khám
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {clinics.filter(c => c.role === 'owner').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phòng khám sở hữu
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {clinics.filter(c => c.status === 'accepted').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đang hoạt động
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Clinic Cards */}
            <Grid container spacing={3}>
              {clinics.map((clinic, index) => (
                <Grid item xs={12} sm={6} md={4} key={clinic.id}>
                  <Zoom in timeout={300 + index * 100}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[12],
                          '& .clinic-header': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          },
                        },
                      }}
                    >
                      {/* Card Header */}
                      <Box
                        className="clinic-header"
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.primary.dark, 0.6)} 100%)`,
                          color: 'white',
                          p: 3,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Avatar
                            sx={{
                              width: 50,
                              height: 50,
                              bgcolor: alpha('#fff', 0.2),
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            {getClinicIcon(clinic.role)}
                          </Avatar>
                          <Box display="flex" gap={0.5}>
                            <Chip
                              icon={clinic.role === 'owner' ? <StarIcon /> : <PeopleIcon />}
                              label={getRoleText(clinic.role)}
                              size="small"
                              sx={{
                                bgcolor: alpha('#fff', 0.2),
                                color: 'white',
                                fontWeight: 600,
                                backdropFilter: 'blur(10px)',
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                          {clinic.name}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, opacity: 0.9 }} />
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {formatDate(clinic.createdAt)}
                          </Typography>
                        </Box>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box mb={2}>
                          <Chip
                            label={getStatusText(clinic.status)}
                            color={getStatusColor(clinic.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Mã phòng khám:</strong>
                          </Typography>
                          <Typography
                            variant="h6"
                            fontFamily="monospace"
                            fontWeight="bold"
                            color="primary.main"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              textAlign: 'center',
                            }}
                          >
                            {clinic.code}
                          </Typography>
                        </Box>
                      </CardContent>

                      {clinic.status === 'accepted' && (
                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={clinic.role === 'owner' ? <SettingsIcon /> : <ViewIcon />}
                            onClick={() => handleManageClinic(clinic.id)}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              py: 1.5,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
                              },
                            }}
                          >
                            {clinic.role === 'owner' ? 'Quản lý phòng khám' : 'Xem thông tin'}
                          </Button>
                        </CardActions>
                      )}

                      {clinic.status === 'pending' && (
                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Alert severity="warning" sx={{ width: '100%', borderRadius: 2 }}>
                            <Typography variant="body2">
                              Đang chờ phòng khám phê duyệt yêu cầu tham gia của bạn
                            </Typography>
                          </Alert>
                        </CardActions>
                      )}
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Layout>
  );
}

export default ClinicList;