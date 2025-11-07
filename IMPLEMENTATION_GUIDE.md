# Frontend Improvements Implementation Guide

## Completed Work

### Infrastructure
- ✅ Installed Material-UI (@mui/material, @mui/icons-material, @emotion/react, @emotion/styled)
- ✅ Installed recharts for data visualization
- ✅ Created theme configuration with light blue color scheme (`src/theme.js`)
- ✅ Created reusable Layout component with sidebar navigation (`src/components/Layout.js`)
- ✅ Created utility functions for VND currency formatting (`src/utils/formatters.js`)

### Pages Completed
- ✅ Home page with product introduction
- ✅ Login page with Vietnamese localization and redirect logic
- ✅ Register page with Vietnamese localization and redirect logic
- ✅ Profile page with edit functionality
- ✅ ClinicList page
- ✅ CreateClinic page
- ✅ JoinClinic page
- ✅ ClinicManagement page with salary management
- ✅ PatientList page

## Remaining Work

### Patient Pages
1. **PatientForm.js** - Needs update for create/edit patient
   - Use Material-UI components
   - Vietnamese labels
   - Use formatters for date
   - Wrap in Layout component

2. **PatientDetail.js** - Needs update to show patient details
   - Material-UI Card layout
   - Show patient info and treatment history
   - Vietnamese labels

### Treatment Pages  
1. **TreatmentList.js**
   - Similar structure to PatientList
   - Show treatments with VND currency format
   - Vietnamese labels

2. **TreatmentForm.js**
   - Material-UI form components
   - VND currency input
   - Vietnamese labels

3. **TreatmentDetail.js**
   - Show treatment details and payments
   - Use formatCurrency for amounts
   - Vietnamese labels

### Appointment Pages
1. **AppointmentList.js**
   - Material-UI Table
   - Status chips (pending, confirmed, completed, cancelled)
   - Vietnamese labels

2. **CalendarView.js**
   - May need calendar library or keep current implementation
   - Update text to Vietnamese

### Inventory Pages
1. **SupplierList.js**
   - Material-UI components
   - Vietnamese labels
   - VND currency format

### Reports Page
1. **RevenueDashboard.js** - CRITICAL
   - Add owner-only access control check
   - Use recharts for visualizations (BarChart, PieChart, LineChart)
   - Show:
     - Total earnings (from treatments)
     - Total expenses (to suppliers)
     - Salaries (from clinic members)
     - Final revenue calculation
   - All amounts in VND
   - Vietnamese labels

### Dashboard Page
1. **Dashboard.js**
   - Update to use new Layout
   - Vietnamese text
   - Material-UI components
   - Remove if not needed (can redirect to /profile or /clinics)

## Implementation Pattern

For each page, follow this pattern:

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  // ... other MUI components
} from '@mui/material';
import {
  IconName as IconNameIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { serviceAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

function PageName() {
  const { clinicId } = useParams();
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Load data
  }, [navigate]);
  
  // Determine user role for pages in clinic context
  // const currentMember = members.find(m => m.id === storedUser.id);
  // setUserRole(currentMember?.role || '');

  return (
    <Layout showClinicMenu={clinicId} clinicId={clinicId} userRole={userRole}>
      <Box>
        {/* Page content */}
      </Box>
    </Layout>
  );
}

export default PageName;
```

## Vietnamese Translations Reference

### Common Terms
- Patient = Bệnh nhân
- Treatment = Điều trị
- Appointment = Lịch hẹn
- Supplier = Nhà cung cấp
- Revenue = Doanh thu
- Expense = Chi phí
- Salary = Lương
- Total = Tổng
- Add = Thêm
- Edit = Chỉnh sửa
- Delete = Xóa
- View = Xem
- Save = Lưu
- Cancel = Hủy
- Search = Tìm kiếm
- Name = Tên
- Phone = Số điện thoại
- Address = Địa chỉ
- Date of Birth = Ngày sinh
- Status = Trạng thái
- Actions = Thao tác
- Description = Mô tả
- Amount = Số tiền
- Date = Ngày
- Details = Chi tiết
- List = Danh sách
- Management = Quản lý

### Status Values
- Pending = Đang chờ
- Confirmed = Đã xác nhận
- Completed = Hoàn thành
- Cancelled = Đã hủy
- Paid = Đã thanh toán
- Unpaid = Chưa thanh toán

## Testing Checklist

After implementing all pages:
1. [ ] Login/Register flow works
2. [ ] Profile page shows and updates user info
3. [ ] Can create and join clinics
4. [ ] Clinic management shows members and allows salary setting (owner only)
5. [ ] Can add, edit, view, delete patients
6. [ ] Can add, edit, view treatments
7. [ ] Treatments show correct VND amounts
8. [ ] Can manage appointments
9. [ ] Can manage suppliers
10. [ ] Revenue dashboard shows (owner only)
11. [ ] All text is in Vietnamese
12. [ ] All currency is in VND format
13. [ ] Sidebar navigation works correctly
14. [ ] Role-based access control works

## Security Considerations

- Revenue dashboard must check user role before displaying
- Only owners should see financial data
- Check authentication on all pages
- Validate user permissions on backend as well

## API Additions Needed

May need to add these API endpoints if they don't exist:
- GET `/clinics/:id` - Get clinic details
- GET `/clinics/:id/revenue` - Get revenue data (owner only)
- PUT `/clinics/:id/members/:memberId` - Update member salary

## Style Notes

- Use light blue theme (primary color: #03A9F4)
- Cards should have rounded corners (borderRadius: 12)
- Buttons should not be all-caps (textTransform: 'none')
- Use consistent spacing (mb: 3 for major sections)
- Tables should be in Paper components with TableContainer
