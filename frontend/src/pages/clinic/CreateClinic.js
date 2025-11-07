import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { clinicService } from '../../services/api';

function CreateClinic() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Vui lòng nhập tên phòng khám');
      return;
    }

    setLoading(true);
    try {
      const response = await clinicService.createClinic(name);
      setSuccess(`Tạo phòng khám thành công! Mã phòng khám: ${response.data.code}`);
      setName('');
      setTimeout(() => {
        navigate('/clinics');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo phòng khám');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clinics');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <BusinessIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
            Tạo phòng khám mới
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Tên phòng khám"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên phòng khám"
              disabled={loading}
              margin="normal"
            />

            <Box display="flex" gap={2} mt={3}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo phòng khám'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default CreateClinic;
