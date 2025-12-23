# Data Generator Script - Summary

## Overview
This PR successfully implements a comprehensive data generation script for the Clinic Management system with realistic Vietnamese data.

## Files Created/Modified

### 1. DataGenerator.java
**Location**: `backend/src/main/java/com/hust/clinic/DataGenerator.java`

**Key Features**:
- Implements `CommandLineRunner` to run automatically on application startup
- Checks if database is empty before generating data (prevents duplicates)
- Uses `PasswordEncoder` for secure password hashing
- All dates distributed across 2024-2025 for analytics/statistics

**Data Generated**:
```
Users: 4 (1 owner + 3 staff)
  - Owner: Nguyễn Văn Minh (0901234567)
  - Staff: Trần Thị Hương (0912345678)
  - Staff: Lê Quốc Hùng (0923456789)
  - Staff: Phạm Thị Mai (0934567890)
  Password for all: 123456

Clinic: 1
  - Name: Phòng Khám Nha Khoa Nụ Cười
  - Code: NK2024
  - Members: All 4 users added

Patients: 200
  - Vietnamese names (e.g., Nguyễn Văn An, Trần Thị Lan)
  - Addresses from VN provinces
  - Phone: 08xxxxxxxx or 09xxxxxxxx (10 digits)

Treatments: 300
  - Distributed: Jan 2024 - Dec 2025
  - Descriptions: Vietnamese dental services
  - Cost: 500,000 - 10,000,000 VNĐ

Appointments: 100
  - Distributed: Jan 2024 - Dec 2025
  - Status: scheduled, completed, cancelled
  - Descriptions: Vietnamese

Payments: Variable (per treatment)
  - Scenario 1 (~33%): Full payment once
  - Scenario 2 (~33%): Multiple payments, fully paid
  - Scenario 3 (~33%): Multiple payments, still has debt

Inventory Items: 30
  - Categories: MEDICINE, SUPPLY, EQUIPMENT
  - Vietnamese medical supply names

Item Batches: ~60 (1-3 per item)
  - Import dates from 2023-2025
  - Expiry dates 12-36 months ahead

Inventory Transactions: 100
  - Types: IMPORT, EXPORT
  - Dates: Jan 2024 - Dec 2025
  - referenceType: NULL (as requested)
  - referenceId: NULL (as requested)
  - Some export descriptions mention treatments

Lab Partners: 3
  - Phòng Xét Nghiệm Nha Khoa An Khang
  - Trung Tâm Xét Nghiệm Nha Khoa Sài Gòn
  - Phòng Lab Răng Hàm Mặt Hà Nội

Lab Orders: 50
  - Selected from 50 random treatments
  - Status: ORDERED, RECEIVED, INSTALLED
  - Price: 1,000,000 - 5,000,000 VNĐ
```

### 2. DATA_GENERATOR_README.md
**Location**: `DATA_GENERATOR_README.md`

Comprehensive documentation including:
- Overview of all generated data
- Step-by-step usage instructions
- Default credentials
- How to disable/enable the generator
- Troubleshooting guide
- Vietnamese language descriptions

### 3. toggle_data_generator.sh
**Location**: `toggle_data_generator.sh`

**Purpose**: Easily enable/disable the data generator

**Usage**:
```bash
./toggle_data_generator.sh
```

**Features**:
- Cross-platform compatible (Linux/macOS)
- Shows current status
- Toggles @Component annotation
- Provides clear feedback

### 4. README.md (Updated)
**Location**: `README.md`

Added section:
- Sample Data Generator overview
- What gets generated
- Default credentials
- How to disable/enable
- Link to detailed documentation

## Technical Implementation

### Vietnamese Data Arrays
- **Names**: 20 first names × 20 middle names × 30 last names = 12,000 combinations
- **Provinces**: 20 major Vietnamese provinces/cities
- **Phone Numbers**: Format 08xxxxxxxx or 09xxxxxxxx (10 digits)
- **Treatment Descriptions**: 15 common dental procedures in Vietnamese
- **Appointment Descriptions**: 10 common appointment types in Vietnamese

### Date Distribution
All time-based data (treatments, appointments, payments, inventory transactions) are distributed across:
- **Start**: January 1, 2024
- **End**: December 31, 2025
- **Purpose**: Enable meaningful statistics and reporting

### Payment Scenarios
Three realistic payment scenarios:
1. **Full Payment** (1 payment = 100% of treatment cost)
2. **Installments - Paid** (2-4 payments = 100% of treatment cost)
3. **Installments - Debt** (1-2 payments = 30-80% of treatment cost)

### Safety Features
1. **Duplicate Prevention**: Checks if users exist before generating
2. **Transaction Safety**: Uses Spring's transaction management
3. **Data Validation**: All entities use proper validation
4. **Error Handling**: Graceful handling of edge cases

## Usage

### Automatic (Default)
```bash
cd backend
mvn spring-boot:run
```
Data will be generated automatically on first run.

### Manual Control

**Disable**:
```bash
./toggle_data_generator.sh
```

**Enable again**:
```bash
./toggle_data_generator.sh
```

### Login After Generation
Use any of these credentials:
- Phone: `0901234567` Password: `123456` (Owner)
- Phone: `0912345678` Password: `123456` (Staff)
- Phone: `0923456789` Password: `123456` (Staff)
- Phone: `0934567890` Password: `123456` (Staff)

## Build Status
✅ Compiles successfully with Maven
✅ No deprecation warnings (uses RoundingMode.DOWN)
✅ All imports clean
✅ Cross-platform compatible

## Code Quality
- ✅ Follows Spring Boot best practices
- ✅ Uses dependency injection (@Autowired)
- ✅ Implements CommandLineRunner interface
- ✅ Proper use of @Component annotation
- ✅ Clean code with helper methods
- ✅ Well-commented and readable
- ✅ All code review issues addressed

## Testing Recommendations

After generating data, verify:

1. **Users**: Check all 4 users exist and can login
2. **Clinic**: Verify clinic has 4 members
3. **Patients**: Check 200 patients with Vietnamese names
4. **Treatments**: Verify 300 treatments across 2024-2025
5. **Appointments**: Check 100 appointments with various statuses
6. **Payments**: Verify different payment scenarios
7. **Inventory**: Check 30 items with batches
8. **Transactions**: Verify 100 transactions with NULL references
9. **Lab Partners**: Check 3 partners exist
10. **Lab Orders**: Verify 50 orders linked to treatments

## Console Output Example
```
=== Bắt đầu tạo dữ liệu mẫu ===
1. Tạo users...
2. Tạo phòng khám...
3. Thêm nhân viên vào phòng khám...
4. Tạo 200 bệnh nhân...
5. Tạo 300 treatment...
6. Tạo 100 appointment...
7. Tạo payment records...
8. Tạo 30 vật tư y tế...
9. Tạo các lô hàng...
10. Tạo 100 giao dịch kho...
11. Tạo 3 lab partner...
12. Tạo 50 lab order...
=== Hoàn thành tạo dữ liệu mẫu ===
- Số lượng Users: 4
- Số lượng Clinics: 1
- Số lượng Patients: 200
- Số lượng Treatments: 300
- Số lượng Appointments: 100
- Số lượng Payments: [varies]
- Số lượng Inventory Items: 30
- Số lượng Item Batches: [varies]
- Số lượng Inventory Transactions: 100
- Số lượng Lab Partners: 3
- Số lượng Lab Orders: 50
```

## Notes

1. **One-time execution**: Data generator only runs when database is empty
2. **Password security**: All passwords are properly encoded using BCrypt
3. **Vietnamese language**: All names, addresses, and descriptions use Vietnamese
4. **Statistics ready**: Date distribution supports 2024-2025 reporting
5. **Realistic data**: Payment scenarios mirror real-world clinic operations

## Future Enhancements (Optional)

If needed in the future, the script could be extended to:
- Accept command-line parameters for data quantities
- Generate data for multiple clinics
- Support custom date ranges
- Export generated data to CSV/JSON
- Add more complex treatment relationships
- Generate prescription data
- Create medical history records
