import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { paymentService } from '../../services/api';

function ClientPaymentManagement({ clinicId, setUserRole }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientStats, setClientStats] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'totalPayment', 'debt'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.role) {
      setUserRole(storedUser.role);
    }
    fetchClientStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, setUserRole]);

  const fetchClientStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentService.getClientPaymentStats(clinicId);
      setClientStats(response.data);
    } catch (err) {
      console.error('Error fetching client payment stats:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu thống kê thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getFilteredAndSortedData = () => {
    let filtered = [...clientStats];

    // Filter based on selection
    if (filterType === 'totalPayment') {
      // Show all, but we'll sort by totalPayment later
    } else if (filterType === 'debt') {
      // Show only clients with debt
      filtered = filtered.filter(client => client.totalDebt > 0);
    }

    // Sort based on filter type and sort order
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (filterType === 'totalPayment') {
        aValue = a.totalPayment;
        bValue = b.totalPayment;
      } else if (filterType === 'debt') {
        aValue = a.totalDebt;
        bValue = b.totalDebt;
      } else {
        // Default: sort by totalDebt
        aValue = a.totalDebt;
        bValue = b.totalDebt;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  };

  const displayData = getFilteredAndSortedData();

  return (
    <Box sx={{ pb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <AccountBalanceIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight="bold">
          Quản lý Thanh toán Khách hàng
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Bộ lọc
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={handleFilterChange}
                size="small"
              >
                <ToggleButton value="all">
                  Tất cả
                </ToggleButton>
                <ToggleButton value="totalPayment">
                  Tổng Payment
                </ToggleButton>
                <ToggleButton value="debt">
                  Còn nợ
                </ToggleButton>
              </ToggleButtonGroup>

              <IconButton
                onClick={toggleSortOrder}
                color="primary"
                size="small"
                title={sortOrder === 'asc' ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần'}
              >
                {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>STT</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tên khách hàng</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Số điện thoại</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Tổng chi phí điều trị</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Đã thanh toán</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Còn nợ</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayData.length > 0 ? (
                  displayData.map((client, index) => (
                    <TableRow
                      key={client.patientId}
                      sx={{
                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{client.patientName}</Typography>
                      </TableCell>
                      <TableCell>{client.phone || 'N/A'}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="medium" color="primary">
                          {formatCurrency(client.totalPayment)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main">
                          {formatCurrency(client.totalPaid)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight="bold"
                          color={client.totalDebt > 0 ? 'error.main' : 'text.secondary'}
                        >
                          {formatCurrency(client.totalDebt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {client.totalDebt > 0 ? (
                          <Chip
                            label="Còn nợ"
                            color="error"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Đã thanh toán"
                            color="success"
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" py={4}>
                        Không có dữ liệu
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}

export default ClientPaymentManagement;
