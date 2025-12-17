import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { inventoryService, clinicService } from '../../services/api';

function ItemForm() {
  const { clinicId, itemId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(itemId);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    minStockLevel: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const membersResponse = await clinicService.getClinicMembers(clinicId);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
        setUserRole(currentMember?.role || '');

        if (isEditMode) {
          setLoading(true);
          const response = await inventoryService.getItem(clinicId, itemId);
          const item = response.data;
          setFormData({
            name: item.name,
            unit: item.unit,
            minStockLevel: item.minStockLevel,
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clinicId, itemId, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        minStockLevel: parseInt(formData.minStockLevel),
      };

      if (isEditMode) {
        await inventoryService.updateItem(clinicId, itemId, data);
      } else {
        await inventoryService.createItem(clinicId, data);
      }

      navigate(`/clinics/${clinicId}/inventory/items`);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu vật tư');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
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
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mr: 3,
                  bgcolor: 'primary.main',
                }}
              >
                <InventoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  {isEditMode ? 'Chỉnh sửa Vật tư' : 'Thêm Vật tư Mới'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {isEditMode ? 'Cập nhật thông tin vật tư' : 'Tạo vật tư mới trong kho'}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/clinics/${clinicId}/inventory/items`)}
              sx={{ borderRadius: 2 }}
            >
              Quay lại
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên vật tư"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Đơn vị tính"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    placeholder="VD: hộp, chai, viên..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mức tồn kho tối thiểu"
                    name="minStockLevel"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/clinics/${clinicId}/inventory/items`)}
                      sx={{ borderRadius: 2 }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      {loading ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default ItemForm;
