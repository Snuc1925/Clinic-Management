import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
  Grid,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { authService } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    phone: '',
    fullName: '',
    address: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        phone: formData.phone,
        fullName: formData.fullName,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth || null,
        password: formData.password,
      };

      await authService.register(userData);
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <LocalHospital sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
            Hệ thống Quản lý Phòng khám
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
            Đăng ký tài khoản
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ngày sinh"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
            <Box textAlign="center">
              <Typography variant="body2">
                Đã có tài khoản?{' '}
                <MuiLink component={Link} to="/login" underline="hover">
                  Đăng nhập ngay
                </MuiLink>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <MuiLink component={Link} to="/" underline="hover">
                  Quay lại trang chủ
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
