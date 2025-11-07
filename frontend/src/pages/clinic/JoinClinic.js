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
import { GroupAdd as GroupAddIcon } from '@mui/icons-material';
import { clinicService } from '../../services/api';

function JoinClinic() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code.trim()) {
      setError('Vui lòng nhập mã phòng khám');
      return;
    }

    if (code.trim().length !== 6) {
      setError('Mã phòng khám phải có 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await clinicService.joinClinic(code.trim().toUpperCase());
      setSuccess('Gửi yêu cầu tham gia thành công! Vui lòng chờ chủ phòng khám phê duyệt.');
      setCode('');
      setTimeout(() => {
        navigate('/clinics');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tham gia phòng khám');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clinics');
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 6) {
      setCode(value);
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
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <GroupAddIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
            Tham gia phòng khám
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Nhập mã 6 ký tự để yêu cầu tham gia phòng khám hiện có.
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
              label="Mã phòng khám"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Nhập mã 6 ký tự"
              disabled={loading}
              margin="normal"
              inputProps={{
                maxLength: 6,
                style: {
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  fontSize: '20px',
                },
              }}
              helperText="Mã không phân biệt chữ hoa chữ thường và chứa chữ cái và số"
            />

            <Box display="flex" gap={2} mt={3}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? 'Đang gửi yêu cầu...' : 'Tham gia'}
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

export default JoinClinic;
