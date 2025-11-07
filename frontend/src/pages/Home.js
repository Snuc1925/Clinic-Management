import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  LocalHospital,
  People,
  CalendarMonth,
  Assessment,
  Security,
  Speed,
} from '@mui/icons-material';

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const features = [
    {
      icon: <LocalHospital sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Quản lý Phòng khám',
      description: 'Quản lý thông tin phòng khám, nhân viên và cơ sở vật chất một cách dễ dàng',
    },
    {
      icon: <People sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Quản lý Bệnh nhân',
      description: 'Lưu trữ hồ sơ bệnh nhân, lịch sử khám bệnh và điều trị chi tiết',
    },
    {
      icon: <CalendarMonth sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Lịch hẹn',
      description: 'Đặt lịch hẹn khám, theo dõi và quản lý lịch làm việc hiệu quả',
    },
    {
      icon: <Assessment sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Thống kê Báo cáo',
      description: 'Báo cáo doanh thu, chi phí và phân tích hiệu quả kinh doanh',
    },
    {
      icon: <Security sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Bảo mật',
      description: 'Dữ liệu được bảo mật và phân quyền truy cập chặt chẽ',
    },
    {
      icon: <Speed sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Nhanh chóng',
      description: 'Giao diện thân thiện, dễ sử dụng và xử lý nhanh chóng',
    },
  ];

  const pricing = [
    {
      name: 'Miễn phí',
      price: '0 VND',
      features: [
        'Quản lý tối đa 50 bệnh nhân',
        'Lưu trữ dữ liệu 6 tháng',
        'Hỗ trợ email',
        'Chức năng cơ bản',
      ],
    },
    {
      name: 'Cơ bản',
      price: '500,000 VND/tháng',
      features: [
        'Quản lý không giới hạn bệnh nhân',
        'Lưu trữ dữ liệu vĩnh viễn',
        'Hỗ trợ 24/7',
        'Tất cả tính năng nâng cao',
        'Báo cáo chi tiết',
      ],
      popular: true,
    },
    {
      name: 'Cao cấp',
      price: '1,000,000 VND/tháng',
      features: [
        'Tất cả tính năng Cơ bản',
        'Tích hợp API',
        'Đào tạo nhân viên',
        'Tùy chỉnh theo yêu cầu',
        'Quản lý đa chi nhánh',
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hệ thống Quản lý Phòng khám
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
          <Button color="inherit" onClick={() => navigate('/register')}>
            Đăng ký
          </Button>
          {token && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/clinics')}
              sx={{ ml: 2 }}
            >
              Vào phòng khám
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Quản lý Phòng khám Chuyên nghiệp
          </Typography>
          <Typography variant="h5" paragraph>
            Giải pháp toàn diện cho việc quản lý phòng khám nha khoa hiện đại
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Bắt đầu ngay
            </Button>
            <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white' }}>
              Tìm hiểu thêm
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold" id="features">
          Tính năng
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Các tính năng mạnh mẽ giúp bạn quản lý phòng khám hiệu quả
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom fontWeight="bold" id="pricing">
            Bảng giá
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Chọn gói phù hợp với nhu cầu của bạn
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {pricing.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={plan.popular ? 8 : 2}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.popular ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                >
                  {plan.popular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 3,
                        py: 0.5,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle2">Phổ biến nhất</Typography>
                    </Box>
                  )}
                  <Typography variant="h5" align="center" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" align="center" color="primary" gutterBottom fontWeight="bold">
                    {plan.price}
                  </Typography>
                  <Box sx={{ mt: 3, flexGrow: 1 }}>
                    {plan.features.map((feature, idx) => (
                      <Typography key={idx} variant="body1" paragraph>
                        ✓ {feature}
                      </Typography>
                    ))}
                  </Box>
                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={() => navigate('/register')}
                  >
                    Chọn gói này
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold" id="about">
          Về chúng tôi
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Chúng tôi cam kết cung cấp giải pháp quản lý phòng khám tốt nhất
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Sứ mệnh
            </Typography>
            <Typography paragraph>
              Cung cấp công cụ quản lý phòng khám đơn giản, hiệu quả và dễ sử dụng cho các
              phòng khám nha khoa tại Việt Nam.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Tầm nhìn
            </Typography>
            <Typography paragraph>
              Trở thành nền tảng quản lý phòng khám hàng đầu, giúp các phòng khám vận hành
              hiệu quả và chuyên nghiệp hơn.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Support Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom fontWeight="bold" id="support">
            Hỗ trợ
          </Typography>
          <Typography variant="h6" align="center" paragraph>
            Liên hệ với chúng tôi để được hỗ trợ
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" paragraph>
              Email: support@clinicmanagement.vn
            </Typography>
            <Typography variant="body1" paragraph>
              Hotline: 1900-xxxx
            </Typography>
            <Typography variant="body1">
              Địa chỉ: Hà Nội, Việt Nam
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 4, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Hệ thống Quản lý Phòng khám. Tất cả quyền được bảo lưu.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
