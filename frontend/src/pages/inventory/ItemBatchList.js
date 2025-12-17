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
  Alert,
  CircularProgress,
  Card,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalShipping as ShippingIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { inventoryService, clinicService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

function ItemBatchList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importBatches, setImportBatches] = useState([{
    itemId: '',
    quantity: '',
    unitPrice: '',
    expiryDate: '',
  }]);
  const [exportItems, setExportItems] = useState([{
    itemId: '',
    quantity: '',
  }]);
  const theme = useTheme();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsResponse, expiringBatchesResponse, membersResponse] = await Promise.all([
        inventoryService.getClinicItems(clinicId),
        inventoryService.getExpiringBatches(clinicId, 60),
        clinicService.getClinicMembers(clinicId),
      ]);
      
      setItems(itemsResponse.data);
      setBatches(expiringBatchesResponse.data);
      
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

  const handleAddBatchRow = () => {
    setImportBatches([...importBatches, {
      itemId: '',
      quantity: '',
      unitPrice: '',
      expiryDate: '',
    }]);
  };

  const handleRemoveBatchRow = (index) => {
    const newBatches = importBatches.filter((_, i) => i !== index);
    setImportBatches(newBatches);
  };

  const handleBatchChange = (index, field, value) => {
    const newBatches = [...importBatches];
    newBatches[index][field] = value;
    setImportBatches(newBatches);
  };

  const handleImportSubmit = async () => {
    try {
      const batchesData = {
        batches: importBatches.map(batch => ({
          itemId: parseInt(batch.itemId),
          quantity: parseInt(batch.quantity),
          unitPrice: parseFloat(batch.unitPrice),
          expiryDate: batch.expiryDate || null,
        })),
      };

      await inventoryService.importBatches(clinicId, batchesData);
      setShowImportDialog(false);
      setImportBatches([{
        itemId: '',
        quantity: '',
        unitPrice: '',
        expiryDate: '',
      }]);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể nhập kho');
    }
  };

  const handleAddExportRow = () => {
    setExportItems([...exportItems, {
      itemId: '',
      quantity: '',
    }]);
  };

  const handleRemoveExportRow = (index) => {
    const newItems = exportItems.filter((_, i) => i !== index);
    setExportItems(newItems);
  };

  const handleExportChange = (index, field, value) => {
    const newItems = [...exportItems];
    newItems[index][field] = value;
    setExportItems(newItems);
  };

  const handleExportSubmit = async () => {
    try {
      // Validate inputs
      for (let i = 0; i < exportItems.length; i++) {
        const item = exportItems[i];
        if (!item.itemId || !item.quantity) {
          setError('Vui lòng điền đầy đủ thông tin cho tất cả các vật tư');
          return;
        }
        if (isNaN(parseInt(item.itemId)) || isNaN(parseInt(item.quantity))) {
          setError('Thông tin vật tư hoặc số lượng không hợp lệ');
          return;
        }
        if (parseInt(item.quantity) <= 0) {
          setError('Số lượng phải lớn hơn 0');
          return;
        }
      }

      const exportData = {
        exports: exportItems.map(item => ({
          itemId: parseInt(item.itemId),
          quantity: parseInt(item.quantity),
        })),
      };

      await inventoryService.exportInventory(clinicId, exportData);
      setShowExportDialog(false);
      setExportItems([{
        itemId: '',
        quantity: '',
      }]);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xuất kho');
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return { label: 'Không có HSD', color: 'default' };
    if (days < 0) return { label: 'Đã hết hạn', color: 'error' };
    if (days <= 30) return { label: `Còn ${days} ngày`, color: 'error' };
    if (days <= 60) return { label: `Còn ${days} ngày`, color: 'warning' };
    return { label: `Còn ${days} ngày`, color: 'success' };
  };

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
                <ShippingIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Quản lý Lô hàng
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Theo dõi các lô hàng sắp hết hạn và nhập hàng mới
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/clinics/${clinicId}/inventory/items`)}
                sx={{ borderRadius: 2 }}
              >
                Quay lại
              </Button>
              <Button
                variant="outlined"
                startIcon={<RemoveIcon />}
                onClick={() => setShowExportDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                Xuất kho
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowImportDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                Nhập kho
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

        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: 'white',
              p: 3,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Lô hàng sắp hết hạn (60 ngày) - {batches.length} lô
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên vật tư</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Đơn vị</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số lượng còn</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Đơn giá</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ngày hết hạn</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Không có lô hàng nào sắp hết hạn
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => {
                    const expiryStatus = getExpiryStatus(batch.expiryDate);
                    return (
                      <TableRow key={batch.id} hover>
                        <TableCell>{batch.itemName}</TableCell>
                        <TableCell>{batch.itemUnit}</TableCell>
                        <TableCell>
                          <Typography fontWeight="bold" color="primary">
                            {batch.quantityRemaining}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {batch.unitPrice?.toLocaleString('vi-VN')}₫
                        </TableCell>
                        <TableCell>{batch.expiryDate ? formatDate(batch.expiryDate) : 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={expiryStatus.label}
                            color={expiryStatus.color}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Import Dialog */}
        <Dialog 
          open={showImportDialog} 
          onClose={() => setShowImportDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Nhập kho mới
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {importBatches.map((batch, index) => (
                <Card key={index} sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Vật tư"
                        value={batch.itemId}
                        onChange={(e) => handleBatchChange(index, 'itemId', e.target.value)}
                        SelectProps={{ native: true }}
                        required
                      >
                        <option value="">Chọn vật tư</option>
                        {items.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.unit})
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Số lượng"
                        value={batch.quantity}
                        onChange={(e) => handleBatchChange(index, 'quantity', e.target.value)}
                        required
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Đơn giá"
                        value={batch.unitPrice}
                        onChange={(e) => handleBatchChange(index, 'unitPrice', e.target.value)}
                        required
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Ngày hết hạn"
                        value={batch.expiryDate}
                        onChange={(e) => handleBatchChange(index, 'expiryDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      {importBatches.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveBatchRow(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddBatchRow}
                sx={{ mt: 1 }}
              >
                Thêm lô hàng
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowImportDialog(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleImportSubmit}>
              Nhập kho
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Dialog */}
        <Dialog 
          open={showExportDialog} 
          onClose={() => setShowExportDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Xuất kho
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {exportItems.map((item, index) => (
                <Card key={index} sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <TextField
                        select
                        fullWidth
                        label="Vật tư"
                        value={item.itemId}
                        onChange={(e) => handleExportChange(index, 'itemId', e.target.value)}
                        SelectProps={{ native: true }}
                        required
                      >
                        <option value="">Chọn vật tư</option>
                        {items.map(inventoryItem => (
                          <option key={inventoryItem.id} value={inventoryItem.id}>
                            {inventoryItem.name} ({inventoryItem.unit}) - Còn: {inventoryItem.currentStock}
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Số lượng"
                        value={item.quantity}
                        onChange={(e) => handleExportChange(index, 'quantity', e.target.value)}
                        required
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      {exportItems.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveExportRow(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddExportRow}
                sx={{ mt: 1 }}
              >
                Thêm vật tư
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowExportDialog(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleExportSubmit}>
              Xuất kho
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default ItemBatchList;
