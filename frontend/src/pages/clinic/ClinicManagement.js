import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Divider,
  Paper,
  Avatar,
  Badge,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AttachMoney as SalaryIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  AccountCircle as AccountIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { clinicService } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

function ClinicManagement() {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [salaryDialog, setSalaryDialog] = useState({ open: false, member: null, salary: '' });
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchClinicData = useCallback(async () => {
    try {
      const [clinicResponse, membersResponse] = await Promise.all([
        clinicService.getClinicById(id),
        clinicService.getClinicMembers(id),
      ]);
      setClinic(clinicResponse.data);
      setClinicName(clinicResponse.data.name);
      setMembers(membersResponse.data);
      
      // Determine user's role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin phòng khám');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchClinicData();
  }, [fetchClinicData, navigate]);

  const handleUpdateClinicName = async () => {
    setError('');
    setSuccess('');
    try {
      await clinicService.updateClinic(id, clinicName);
      setSuccess('Cập nhật tên phòng khám thành công!');
      setEditingName(false);
      fetchClinicData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật tên phòng khám');
    }
  };

  const handleAccept = async (memberId) => {
    try {
      await clinicService.updateMemberStatus(id, memberId, 'accepted');
      setSuccess('Đã chấp nhận thành viên!');
      fetchClinicData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể chấp nhận thành viên');
    }
  };

  const handleReject = async (memberId) => {
    try {
      await clinicService.updateMemberStatus(id, memberId, 'rejected');
      setSuccess('Đã từ chối yêu cầu!');
      fetchClinicData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể từ chối thành viên');
    }
  };

  const handleRemove = async (memberId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await clinicService.removeMember(id, memberId);
        setSuccess('Đã xóa thành viên!');
        fetchClinicData();
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa thành viên');
      }
    }
  };

  const handleOpenSalaryDialog = (member) => {
    setSalaryDialog({ open: true, member, salary: member.salary || '' });
  };

  const handleCloseSalaryDialog = () => {
    setSalaryDialog({ open: false, member: null, salary: '' });
  };

  const handleUpdateSalary = async () => {
    try {
      await clinicService.updateMemberSalary(id, salaryDialog.member.id, parseFloat(salaryDialog.salary));
      setSuccess('Cập nhật lương thành công!');
      handleCloseSalaryDialog();
      fetchClinicData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật lương');
    }
  };

  const getRoleText = (role) => {
    return role === 'owner' ? 'Chủ sở hữu' : 'Thành viên';
  };

  if (loading) {
    return (
      <Layout showClinicMenu clinicId={id} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Đang tải thông tin phòng khám...
            </Typography>
          </Box>
        </Box>
      </Layout>
    );
  }

  const pendingMembers = members.filter(m => m.status === 'pending');
  const acceptedMembers = members.filter(m => m.status === 'accepted');
  const isOwner = userRole === 'owner';

  return (
    <Layout showClinicMenu clinicId={id} userRole={userRole}>
      <Box>
        {/* Enhanced Header */}
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
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
                  bgcolor: 'info.main',
                  background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                }}
              >
                <InfoIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Thông tin phòng khám
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý thông tin và thành viên của phòng khám
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Alerts with animations */}
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
              {success}
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
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {acceptedMembers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thành viên hoạt động
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
                  <Badge badgeContent={pendingMembers.length} color="warning">
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'warning.main',
                      }}
                    >
                      <NotificationIcon />
                    </Avatar>
                  </Badge>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {pendingMembers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yêu cầu chờ duyệt
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
                    <StarIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {members.filter(m => m.role === 'owner').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chủ sở hữu
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
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {clinic ? formatDate(clinic.createdAt).split('/')[2] : '2024'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Năm thành lập
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Enhanced Clinic Info Card */}
        <Fade in timeout={700}>
          <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Thông tin Phòng khám
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Tên phòng khám
                    </Typography>
                    {editingName && isOwner ? (
                      <Box display="flex" gap={1} alignItems="center">
                        <TextField
                          fullWidth
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          size="small"
                          sx={{ borderRadius: 2 }}
                        />
                        <Tooltip title="Lưu">
                          <IconButton 
                            color="primary" 
                            onClick={handleUpdateClinicName}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hủy">
                          <IconButton 
                            onClick={() => {
                              setEditingName(false);
                              setClinicName(clinic.name);
                            }}
                            sx={{
                              bgcolor: alpha(theme.palette.grey[500], 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) }
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                          {clinic?.name}
                        </Typography>
                        {isOwner && (
                          <Tooltip title="Chỉnh sửa tên phòng khám">
                            <IconButton 
                              size="small" 
                              onClick={() => setEditingName(true)}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Mã phòng khám
                  </Typography>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontFamily="monospace"
                      fontWeight="bold"
                      color="primary.main"
                      letterSpacing={2}
                    >
                      {clinic?.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Mã để tham gia phòng khám
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mt={2}>
                    <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo: <strong>{formatDate(clinic?.createdAt)}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Enhanced Pending Requests */}
        {isOwner && pendingMembers.length > 0 && (
          <Fade in timeout={800}>
            <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                  color: 'white',
                  p: 3,
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" fontWeight="bold">
                    <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Yêu cầu tham gia đang chờ
                  </Typography>
                  <Chip
                    label={`${pendingMembers.length} yêu cầu`}
                    sx={{
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        <TableCell><strong>Thông tin thành viên</strong></TableCell>
                        <TableCell><strong>Liên hệ</strong></TableCell>
                        <TableCell><strong>Địa chỉ</strong></TableCell>
                        <TableCell><strong>Ngày yêu cầu</strong></TableCell>
                        <TableCell align="center"><strong>Thao tác</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingMembers.map((member, index) => (
                        <TableRow 
                          key={member.id}
                          sx={{
                            '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.05) },
                            animation: `fadeInUp 0.5s ease-in-out ${index * 0.1}s both`,
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: 'warning.main' }}>
                                <AccountIcon />
                              </Avatar>
                              <Typography fontWeight="medium">{member.fullName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{member.phone}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{member.address || 'N/A'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(member.joinedAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleAccept(member.id)}
                                sx={{ borderRadius: 2, fontWeight: 600 }}
                              >
                                Chấp nhận
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleReject(member.id)}
                                sx={{ borderRadius: 2, fontWeight: 600 }}
                              >
                                Từ chối
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Enhanced Members List */}
        <Fade in timeout={900}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">
                  <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Danh sách thành viên
                </Typography>
                <Chip
                  label={`${acceptedMembers.length} thành viên`}
                  sx={{
                    bgcolor: alpha('#fff', 0.2),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <TableCell><strong>Thông tin thành viên</strong></TableCell>
                      <TableCell><strong>Liên hệ</strong></TableCell>
                      <TableCell><strong>Địa chỉ</strong></TableCell>
                      <TableCell><strong>Vai trò</strong></TableCell>
                      <TableCell><strong>Ngày tham gia</strong></TableCell>
                      {isOwner && <TableCell align="center"><strong>Thao tác</strong></TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {acceptedMembers.map((member, index) => (
                      <TableRow 
                        key={member.id}
                        sx={{
                          '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.05) },
                          animation: `fadeInUp 0.5s ease-in-out ${index * 0.1}s both`,
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar 
                              sx={{ 
                                bgcolor: member.role === 'owner' ? 'primary.main' : 'success.main',
                                border: member.role === 'owner' ? `2px solid ${theme.palette.primary.light}` : 'none',
                              }}
                            >
                              {member.role === 'owner' ? <StarIcon /> : <AccountIcon />}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="medium">{member.fullName}</Typography>
                              {member.role === 'owner' && (
                                <Typography variant="caption" color="primary.main" fontWeight="bold">
                                  Chủ sở hữu
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{member.phone}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{member.address || 'N/A'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getRoleText(member.role)}
                            color={member.role === 'owner' ? 'primary' : 'success'}
                            size="small"
                            icon={member.role === 'owner' ? <StarIcon /> : <PeopleIcon />}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(member.joinedAt)}
                          </Typography>
                        </TableCell>
                        {/* {isOwner && (
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <SalaryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" fontWeight={member.salary ? 'bold' : 'normal'} color={member.salary ? 'success.main' : 'text.secondary'}>
                                {member.salary ? formatCurrency(member.salary) : 'Chưa thiết lập'}
                              </Typography>
                            </Box>
                          </TableCell>
                        )} */}
                        {isOwner && (
                          <TableCell align="center">
                            {member.role !== 'owner' && (
                              <Stack direction="row" spacing={1} justifyContent="center">
                                {/* <Tooltip title="Thiết lập lương">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenSalaryDialog(member)}
                                    sx={{
                                      bgcolor: alpha(theme.palette.success.main, 0.1),
                                      '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                                    }}
                                  >
                                    <SalaryIcon sx={{ color: 'success.main' }} />
                                  </IconButton>
                                </Tooltip> */}
                                <Tooltip title="Xóa thành viên">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemove(member.id)}
                                    sx={{
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                    }}
                                  >
                                    <DeleteIcon sx={{ color: 'error.main' }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Fade>

        {/* Enhanced Salary Dialog */}
        <Dialog 
          open={salaryDialog.open} 
          onClose={handleCloseSalaryDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <SalaryIcon />
            Thiết lập lương tháng
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <AccountIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {salaryDialog.member?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thành viên phòng khám
                </Typography>
              </Box>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Lương tháng (VND)"
              type="number"
              fullWidth
              value={salaryDialog.salary}
              onChange={(e) => setSalaryDialog({ ...salaryDialog, salary: e.target.value })}
              InputProps={{
                startAdornment: <SalaryIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ borderRadius: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={handleCloseSalaryDialog}
              sx={{ borderRadius: 2 }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateSalary} 
              variant="contained"
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Lưu thay đổi
            </Button>
          </DialogActions>
        </Dialog>
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

export default ClinicManagement;