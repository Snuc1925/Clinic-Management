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
  CardContent,
  Chip,
  Avatar,
  InputAdornment,
  TextField,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { inventoryService, clinicService } from '../../services/api';

function ItemList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const theme = useTheme();

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsResponse, membersResponse] = await Promise.all([
        inventoryService.getClinicItems(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);
      setItems(itemsResponse.data);
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách vật tư');
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
    loadItems();
  }, [loadItems, navigate]);

  const handleDelete = async (itemId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
      try {
        await inventoryService.deleteItem(clinicId, itemId);
        loadItems();
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa vật tư');
      }
    }
  };

  const getStockStatus = (item) => {
    if (item.totalQuantity === 0) {
      return { label: 'Hết hàng', color: 'error', icon: <WarningIcon /> };
    } else if (item.totalQuantity < item.minStockLevel) {
      return { label: 'Sắp hết', color: 'warning', icon: <WarningIcon /> };
    } else {
      return { label: 'Đủ hàng', color: 'success', icon: <CheckCircleIcon /> };
    }
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Đang tải danh sách vật tư...
            </Typography>
          </Box>
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
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
              >
                <InventoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Quản lý Vật tư
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý kho vật tư, theo dõi tồn kho và nhập xuất
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ShippingIcon />}
                onClick={() => navigate(`/clinics/${clinicId}/inventory/batches`)}
                sx={{ borderRadius: 2 }}
              >
                Lô hàng
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/clinics/${clinicId}/inventory/items/new`)}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
              >
                Thêm vật tư
              </Button>
            </Stack>
          </Box>
        </Paper>

        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}

        <Fade in timeout={700}>
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo tên vật tư, đơn vị..."
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
            </CardContent>
          </Card>
        </Fade>

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
                <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Danh sách vật tư ({filteredItems.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên vật tư</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đơn vị</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tồn kho</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Mức tối thiểu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
                            <InventoryIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm ? 'Không tìm thấy vật tư nào' : 'Chưa có vật tư nào'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {searchTerm
                              ? 'Không có kết quả nào phù hợp với tiêu chí tìm kiếm'
                              : 'Hãy thêm vật tư đầu tiên để bắt đầu quản lý'
                            }
                          </Typography>
                          {!searchTerm && (
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => navigate(`/clinics/${clinicId}/inventory/items/new`)}
                              sx={{ borderRadius: 2, mt: 1 }}
                            >
                              Thêm vật tư đầu tiên
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const stockStatus = getStockStatus(item);
                      return (
                        <TableRow 
                          key={item.id} 
                          hover
                          sx={{
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {item.name}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">{item.unit}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body1" fontWeight="bold" color="primary.main">
                              {item.totalQuantity || 0}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">{item.minStockLevel}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={stockStatus.label}
                              color={stockStatus.color}
                              size="small"
                              icon={stockStatus.icon}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/clinics/${clinicId}/inventory/items/${item.id}/edit`)}
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
                                  onClick={() => handleDelete(item.id)}
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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Fade>
      </Box>
    </Layout>
  );
}

export default ItemList;
