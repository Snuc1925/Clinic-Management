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
} from '@mui/icons-material';
import { authService } from '../services/api';

const drawerWidth = 280;

function Layout({ children, clinicId, userRole, showClinicMenu = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
        },
        {
          text: 'Thông tin phòng khám',
          icon: <InfoIcon />,
          path: `/clinics/${clinicId}/manage`,
        },
        {
          text: 'Quản lý bệnh nhân',
          icon: <PatientsIcon />,
          path: `/clinics/${clinicId}/patients`,
        },
        {
          text: 'Quản lý điều trị',
          icon: <TreatmentsIcon />,
          path: `/clinics/${clinicId}/treatments`,
        },
        {
          text: 'Quản lý lịch hẹn',
          icon: <AppointmentsIcon />,
          path: `/clinics/${clinicId}/appointments`,
        },
        {
          text: 'Quản lý labo',
          icon: <LabIcon />,
          path: `/clinics/${clinicId}/suppliers`,
        },
        ...(userRole === 'owner'
          ? [
              {
                text: 'Thống kê, Báo cáo',
                icon: <ReportsIcon />,
                path: `/clinics/${clinicId}/reports/revenue`,
              },
            ]
          : []),
      ]
    : [
        {
          text: 'Thông tin cá nhân',
          icon: <PersonIcon />,
          path: '/profile',
        },
        {
          text: 'Phòng khám của tôi',
          icon: <ClinicIcon />,
          path: '/clinics',
        },
      ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main' }}>
          Quản lý Phòng khám
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Hệ thống Quản lý Phòng khám
          </Typography>
        </Toolbar>
      </AppBar>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;
