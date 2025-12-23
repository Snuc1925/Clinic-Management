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
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  ArrowUpward as ImportIcon,
  ArrowDownward as ExportIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { inventoryService, clinicService } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';

function TransactionHistory() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const theme = useTheme();

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const [transactionsResponse, membersResponse] = await Promise.all([
        inventoryService.getClinicTransactions(clinicId),
        clinicService.getClinicMembers(clinicId),
      ]);
      setTransactions(transactionsResponse.data);
      
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentMember = membersResponse.data.find(m => m.userId === storedUser.id);
      setUserRole(currentMember?.role || '');
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử giao dịch');
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
    loadTransactions();
  }, [loadTransactions, navigate]);

  const getTransactionTypeChip = (type) => {
    if (type === 'IMPORT') {
      return (
        <Chip
          label="Nhập kho"
          color="success"
          size="small"
          icon={<ImportIcon />}
          sx={{ fontWeight: 600 }}
        />
      );
    } else {
      return (
        <Chip
          label="Xuất kho"
          color="error"
          size="small"
          icon={<ExportIcon />}
          sx={{ fontWeight: 600 }}
        />
      );
    }
  };

  if (loading) {
    return (
      <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              Đang tải lịch sử giao dịch...
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
                <HistoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Lịch sử nhập/xuất kho
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Theo dõi toàn bộ lịch sử giao dịch kho
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
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tất cả giao dịch ({transactions.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Loại</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Tên vật tư</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Đơn vị</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Số lượng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Lý do</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
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
                            <HistoryIcon sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            Chưa có giao dịch nào
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Lịch sử nhập/xuất kho sẽ hiển thị ở đây
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow 
                        key={transaction.id} 
                        hover
                        sx={{
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2">
                            {formatDateTime(transaction.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {getTransactionTypeChip(transaction.type)}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {transaction.itemName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2">{transaction.itemUnit}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography 
                            variant="body1" 
                            fontWeight="bold" 
                            color={transaction.type === 'IMPORT' ? 'success.main' : 'error.main'}
                          >
                            {transaction.type === 'IMPORT' ? '+' : '-'}{transaction.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.reason || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
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

export default TransactionHistory;
