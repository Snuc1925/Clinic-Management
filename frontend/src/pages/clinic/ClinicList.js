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
} from '@mui/material';
import {
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

function ClinicList() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    return role === 'owner' ? 'primary' : 'secondary';
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
        return 'Đang chờ';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Phòng khám của tôi
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClinic}
            >
              Tạo phòng khám mới
            </Button>
            <Button
              variant="outlined"
              startIcon={<GroupAddIcon />}
              onClick={handleJoinClinic}
            >
              Tham gia phòng khám
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {clinics.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Chưa có phòng khám nào
              </Typography>
              <Typography color="text.secondary" paragraph>
                Bạn chưa tạo hoặc tham gia phòng khám nào. Hãy tạo mới hoặc tham gia một phòng khám hiện có.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {clinics.map((clinic) => (
              <Grid item xs={12} sm={6} md={4} key={clinic.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                      {clinic.name}
                    </Typography>
                    <Box display="flex" gap={1} mb={2}>
                      <Chip
                        label={getRoleText(clinic.role)}
                        color={getRoleColor(clinic.role)}
                        size="small"
                      />
                      <Chip
                        label={getStatusText(clinic.status)}
                        color={getStatusColor(clinic.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Mã phòng khám:</strong> {clinic.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Ngày tạo:</strong> {formatDate(clinic.createdAt)}
                    </Typography>
                  </CardContent>
                  {clinic.status === 'accepted' && (
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleManageClinic(clinic.id)}
                      >
                        {clinic.role === 'owner' ? 'Quản lý phòng khám' : 'Xem thông tin'}
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Layout>
  );
}

export default ClinicList;
