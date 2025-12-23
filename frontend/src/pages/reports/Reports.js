import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import RevenueManagement from './RevenueManagement';
import DebtManagement from './DebtManagement';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function Reports() {
  const { clinicId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [userRole, setUserRole] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Layout showClinicMenu clinicId={clinicId} userRole={userRole}>
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <AssessmentIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Box component="h1" sx={{ fontSize: '2rem', fontWeight: 'bold', m: 0 }}>
              Thống kê, Báo cáo
            </Box>
          </Box>
        </Box>

        <Paper elevation={2}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Report tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              icon={<AccountBalanceIcon />}
              iconPosition="start"
              label="Quản lý Thu Chi"
              id="report-tab-0"
              aria-controls="report-tabpanel-0"
            />
            <Tab
              icon={<CreditCardIcon />}
              iconPosition="start"
              label="Quản lý Nợ"
              id="report-tab-1"
              aria-controls="report-tabpanel-1"
            />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <RevenueManagement clinicId={clinicId} setUserRole={setUserRole} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <DebtManagement clinicId={clinicId} setUserRole={setUserRole} />
          </TabPanel>
        </Paper>
      </Box>
    </Layout>
  );
}

export default Reports;