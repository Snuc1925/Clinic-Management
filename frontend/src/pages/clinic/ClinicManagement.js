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
} from '@mui/material';
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AttachMoney as SalaryIcon,
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
          <CircularProgress />
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
        <Box display="flex" alignItems="center" mb={3}>
          <InfoIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Thông tin phòng khám
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Clinic Info Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Tên phòng khám
                </Typography>
                {editingName && isOwner ? (
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      size="small"
                    />
                    <IconButton color="primary" onClick={handleUpdateClinicName}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton onClick={() => {
                      setEditingName(false);
                      setClinicName(clinic.name);
                    }}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h5">{clinic.name}</Typography>
                    {isOwner && (
                      <IconButton size="small" onClick={() => setEditingName(true)}>
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Mã phòng khám
                </Typography>
                <Typography variant="h5" color="primary">
                  {clinic.code}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo: {formatDate(clinic.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Pending Requests - Owner Only */}
        {isOwner && pendingMembers.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Yêu cầu tham gia đang chờ ({pendingMembers.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Họ tên</TableCell>
                      <TableCell>Số điện thoại</TableCell>
                      <TableCell>Địa chỉ</TableCell>
                      <TableCell>Ngày yêu cầu</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.fullName}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{member.address || 'N/A'}</TableCell>
                        <TableCell>{formatDate(member.joinedAt)}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleAccept(member.id)}
                            sx={{ mr: 1 }}
                          >
                            Chấp nhận
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleReject(member.id)}
                          >
                            Từ chối
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Danh sách thành viên ({acceptedMembers.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Địa chỉ</TableCell>
                    <TableCell>Vai trò</TableCell>
                    <TableCell>Ngày tham gia</TableCell>
                    {isOwner && <TableCell>Lương tháng</TableCell>}
                    {isOwner && <TableCell>Thao tác</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {acceptedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.fullName}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.address || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleText(member.role)}
                          color={member.role === 'owner' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(member.joinedAt)}</TableCell>
                      {isOwner && (
                        <TableCell>
                          {member.salary ? formatCurrency(member.salary) : 'Chưa thiết lập'}
                        </TableCell>
                      )}
                      {isOwner && (
                        <TableCell>
                          {member.role !== 'owner' && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenSalaryDialog(member)}
                                title="Thiết lập lương"
                              >
                                <SalaryIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemove(member.id)}
                                title="Xóa thành viên"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
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

        {/* Salary Dialog */}
        <Dialog open={salaryDialog.open} onClose={handleCloseSalaryDialog}>
          <DialogTitle>Thiết lập lương tháng</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Thành viên: {salaryDialog.member?.fullName}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Lương tháng (VND)"
              type="number"
              fullWidth
              value={salaryDialog.salary}
              onChange={(e) => setSalaryDialog({ ...salaryDialog, salary: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSalaryDialog}>Hủy</Button>
            <Button onClick={handleUpdateSalary} variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}

export default ClinicManagement;
