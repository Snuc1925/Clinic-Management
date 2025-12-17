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
  Avatar,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as LabIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { labService, clinicService } from '../../services/api';

function LabPartnerList() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [labPartners, setLabPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const theme = useTheme();

  const loadLabPartners = useCallback(async () => {
    try {
      setLoading(true);
      const [partnersResponse, membersResponse] = await Promise.all([
        labService.getClinicLabPartners(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);
      setLabPartners(partnersResponse.data);
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.id === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đối tác xét nghiệm');
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
    loadLabPartners();
  }, [loadLabPartners, navigate]);

  const handleOpenDialog = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        phone: partner.phone,
        address: partner.address,
      });
    } else {
      setEditingPartner(null);
      setFormData({ name: '', phone: '', address: '' });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingPartner(null);
    setFormData({ name: '', phone: '', address: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingPartner) {
        await labService.updateLabPartner(clinicId, editingPartner.id, formData);
      } else {
        await labService.createLabPartner(clinicId, formData);
      }
      handleCloseDialog();
      loadLabPartners();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu đối tác xét nghiệm');
    }
  };

  const handleDelete = async (partnerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tác xét nghiệm này?')) {
      try {
        await labService.deleteLabPartner(clinicId, partnerId);
        loadLabPartners();
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa đối tác xét nghiệm');
      }
    }
  };

  const filteredPartners = labPartners.filter(partner =>
    partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  Đối tác Xét nghiệm
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Quản lý danh sách các phòng xét nghiệm, nha khoa
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ borderRadius: 2 }}
            >
              Thêm đối tác
            </Button>
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
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, số điện thoại..."
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
              Danh sách đối tác ({filteredPartners.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên đối tác</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Số điện thoại</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Địa chỉ</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPartners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
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
                          {searchTerm ? 'Không tìm thấy đối tác nào' : 'Chưa có đối tác nào'}
                        </Typography>
                        {!searchTerm && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ borderRadius: 2, mt: 1 }}
                          >
                            Thêm đối tác đầu tiên
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPartners.map((partner) => (
                    <TableRow 
                      key={partner.id} 
                      hover
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {partner.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{partner.phone}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{partner.address || 'N/A'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(partner)}
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
                              onClick={() => handleDelete(partner.id)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Dialog */}
        <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              {editingPartner ? 'Chỉnh sửa Đối tác' : 'Thêm Đối tác Mới'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên đối tác"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingPartner ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default LabPartnerList;
