import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
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
        const currentMember = membersResponse.data. find(m => m.userId === storedUser.id);
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
        ... formData,
        minStockLevel: parseInt(formData.minStockLevel),
      };

      if (isEditMode) {
        await inventoryService.updateItem(clinicId, itemId, data);
      } else {
        await inventoryService.createItem(clinicId, data);
      }

      navigate(`/clinics/${clinicId}/inventory/items`);
    } catch (err) {
      setError(err.response?.data?. message || 'Không thể lưu vật tư');
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
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            {isEditMode ? (
              <EditIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            ) : (
              <AddIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            )}
            <Typography variant="h4" component="h1" fontWeight="bold">
              {isEditMode ? 'Chỉnh sửa Vật tư' : 'Thêm Vật tư Mới'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/clinics/${clinicId}/inventory/items`)}
          >
            Quay lại danh sách
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              
              <Stack spacing={3}>
                
                <Box>
                  <Typography variant="h6" component="h2" gutterBottom color="primary">
                    <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Thông tin Vật tư
                  </Typography>
                </Box>

                {/* 1. Tên vật tư */}
                <TextField
                  fullWidth
                  label="Tên vật tư *"
                  name="name"
                  value={formData. name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên vật tư, dụng cụ y tế..."
                />

                {/* 2. Đơn vị tính */}
                <TextField
                  fullWidth
                  label="Đơn vị tính *"
                  name="unit"
                  value={formData. unit}
                  onChange={handleChange}
                  required
                  placeholder="VD: hộp, chai, viên, cái, bộ..."
                />

                {/* 3. Mức tồn kho tối thiểu */}
                <TextField
                  fullWidth
                  label="Mức tồn kho tối thiểu *"
                  name="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 1 }}
                  helperText="Hệ thống sẽ cảnh báo khi số lượng tồn kho thấp hơn mức này"
                  InputProps={{
                    endAdornment: (
                      <Typography variant="body2" color="text.secondary">
                        {formData.unit || 'đơn vị'}
                      </Typography>
                    )
                  }}
                />

              </Stack>
              {/* KẾT THÚC STACK */}

              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate(`/clinics/${clinicId}/inventory/items`)}
                  disabled={loading}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo vật tư')}
                </Button>
              </Box>

            </Box>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}

export default ItemForm;