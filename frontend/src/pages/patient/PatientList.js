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
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Quản lý Bệnh nhân
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/clinics/${clinicId}/patients/new`)}
          >
            Thêm bệnh nhân
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Họ tên</strong></TableCell>
                <TableCell><strong>Số điện thoại</strong></TableCell>
                <TableCell><strong>Ngày sinh</strong></TableCell>
                <TableCell><strong>Địa chỉ</strong></TableCell>
                <TableCell align="right"><strong>Thao tác</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      Không tìm thấy bệnh nhân nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map(patient => (
                  <TableRow key={patient.id} hover>
                    <TableCell>{patient.fullName}</TableCell>
                    <TableCell>{patient.phone || 'N/A'}</TableCell>
                    <TableCell>{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}</TableCell>
                    <TableCell>{patient.address || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`/clinics/${clinicId}/patients/${patient.id}`)}
                        title="Xem chi tiết"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/clinics/${clinicId}/patients/${patient.id}/edit`)}
                        title="Chỉnh sửa"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(patient.id)}
                        title="Xóa"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
}

export default PatientList;
