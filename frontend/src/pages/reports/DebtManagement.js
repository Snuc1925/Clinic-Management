import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
} from '@mui/icons-material';

function DebtManagement({ clinicId, setUserRole }) {
  useEffect(() => {
    // Set user role if needed
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.role) {
      setUserRole(storedUser.role);
    }
  }, [setUserRole]);

  return (
    <Box sx={{ pb: 4 }}>
      <Card sx={{ textAlign: 'center', py: 8 }}>
        <CardContent>
          <ConstructionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold" color="text.secondary">
            Chức năng đang phát triển
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Quản lý nợ sẽ được cập nhật trong phiên bản tiếp theo
          </Typography>
        </CardContent>
      </Card>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        Tab Quản lý Nợ đang được phát triển.  Vui lòng quay lại sau! 
      </Alert>
    </Box>
  );
}

export default DebtManagement;