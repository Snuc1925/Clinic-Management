import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  LocalHospital as ClinicIcon,
  People as PatientsIcon,
  MedicalServices as TreatmentsIcon,
  CalendarMonth as AppointmentsIcon,
  Science as LabIcon,
  Assessment as ReportsIcon,
  Info as InfoIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { authService } from '../services/api';

const drawerWidth = 280;

function Layout({ children, clinicId, userRole, showClinicMenu = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = showClinicMenu && clinicId
    ? [
        {
          text: 'Thông tin cá nhân',
          icon: <PersonIcon />,
          path: '/profile',
          color: '#4CAF50', // Green
        },
        {
          text: 'Thông tin phòng khám',
          icon: <InfoIcon />,
          path: `/clinics/${clinicId}/manage`,
          color: '#2196F3', // Blue
        },
        {
          text: 'Quản lý bệnh nhân',
          icon: <PatientsIcon />,
          path: `/clinics/${clinicId}/patients`,
          color: '#FF9800', // Orange
        },
        {
          text: 'Quản lý điều trị',
          icon: <TreatmentsIcon />,
          path: `/clinics/${clinicId}/treatments`,
          color: '#E91E63', // Pink
        },      
        {
          text: 'Quản lý lịch hẹn',
          icon: <AppointmentsIcon />,
          path: `/clinics/${clinicId}/appointments`,
          color: '#9C27B0', // Purple
        },
        {
          text: 'Quản lý vật tư',
          icon: <InventoryIcon />,
          path: `/clinics/${clinicId}/inventory/items`,
          color: '#FF5722', // Deep Orange
        },
        {
          text: 'Quản lý labo',
          icon: <LabIcon />,
          path: `/clinics/${clinicId}/lab-management`,
          color: '#00BCD4', // Cyan
        },
        ...(userRole === 'owner'
          ? [
              {
                text: 'Thống kê, Báo cáo',
                icon: <ReportsIcon />,
                path: `/clinics/${clinicId}/reports/revenue`,
                color: '#795548', // Brown
              },
            ]
          : []),
      ]
    : [
        {
          text: 'Thông tin cá nhân',
          icon: <PersonIcon />,
          path: '/profile',
          color: '#4CAF50', // Green
        },
        {
          text: 'Phòng khám của tôi',
          icon: <ClinicIcon />,
          path: '/clinics',
          color: '#03A9F4', // Light Blue (Primary)
        },
      ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ClinicIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
          Quản lý Phòng khám
        </Typography>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ p: 2 }}>
          {menuItems.map((item, index) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    minHeight: 56,
                    position: 'relative',
                    overflow: 'hidden',
                    '&.Mui-selected': {
                      bgcolor: alpha(item.color, 0.1),
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        bgcolor: item.color,
                      },
                      '& .MuiListItemIcon-root': {
                        color: item.color,
                      },
                      '& .MuiListItemText-primary': {
                        color: item.color,
                        fontWeight: 600,
                      },
                    },
                    '&:hover': {
                      bgcolor: alpha(item.color, 0.05),
                      '& .MuiListItemIcon-root': {
                        color: item.color,
                        transform: 'scale(1.1)',
                      },
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? item.color : 'text.secondary',
                      minWidth: 44,
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: isSelected 
                          ? alpha(item.color, 0.1) 
                          : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '0.95rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            minHeight: 48,
            color: 'error.main',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.05),
              '& .MuiListItemIcon-root': {
                color: 'error.main',
                transform: 'scale(1.1)',
              },
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ListItemIcon
            sx={{
              color: 'error.main',
              minWidth: 44,
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: 'transparent',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <LogoutIcon />
            </Box>
          </ListItemIcon>
          <ListItemText 
            primary="Đăng xuất"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Enhanced AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&:hover': {
                bgcolor: alpha('#fff', 0.1),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <DashboardIcon sx={{ mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                Hệ thống Quản lý Phòng khám
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha('#fff', 0.2),
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {String('Snuc1925').charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Enhanced Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: theme.shadows[2],
              bgcolor: 'background.paper',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Enhanced Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'grey.50',
          position: 'relative',
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important' }} />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper
            elevation={1}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              minHeight: 'calc(100vh - 140px)',
            }}
          >
            {children}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;