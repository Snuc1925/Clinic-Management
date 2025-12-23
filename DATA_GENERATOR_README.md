# Hướng Dẫn Sử Dụng Script Tạo Dữ Liệu Mẫu

## Tổng Quan

Script `DataGenerator.java` tự động tạo dữ liệu mẫu cho hệ thống Quản Lý Phòng Khám với các thông tin tiếng Việt.

## Dữ Liệu Được Tạo

### 1. Users (4 người dùng)
- **1 Chủ phòng khám**: Nguyễn Văn Minh (SĐT: 0901234567)
- **3 Nhân viên**:
  - Trần Thị Hương (SĐT: 0912345678)
  - Lê Quốc Hùng (SĐT: 0923456789)
  - Phạm Thị Mai (SĐT: 0934567890)
- **Mật khẩu mặc định**: `123456` (cho tất cả users)

### 2. Clinic (1 phòng khám)
- **Tên**: Phòng Khám Nha Khoa Nụ Cười
- **Mã**: NK2024
- **Chủ sở hữu**: Nguyễn Văn Minh
- **Nhân viên**: 3 nhân viên được thêm vào

### 3. Patients (200 bệnh nhân)
- Tên tiếng Việt ngẫu nhiên
- Địa chỉ: Các tỉnh thành Việt Nam
- Số điện thoại: Bắt đầu bằng 08 hoặc 09, có 10 chữ số

### 4. Treatments (300 điều trị)
- Phân bố thời gian: 2024 - 2025
- Mô tả: Các dịch vụ nha khoa tiếng Việt
- Chi phí: 500,000 - 10,000,000 VNĐ

### 5. Appointments (100 lịch hẹn)
- Phân bố thời gian: 2024 - 2025
- Trạng thái: scheduled, completed, cancelled
- Mô tả tiếng Việt

### 6. Payments (Thanh toán)
Ba kịch bản thanh toán:
- **Kịch bản 1**: Thanh toán toàn bộ một lần
- **Kịch bản 2**: Thanh toán nhiều lần, trả hết
- **Kịch bản 3**: Thanh toán nhiều lần nhưng vẫn còn nợ

### 7. Inventory Items (30 vật tư y tế)
- Các loại: Thuốc, vật tư, thiết bị
- Đơn giá: 10,000 - 1,000,000 VNĐ

### 8. Item Batches (Lô hàng)
- Mỗi vật tư có 1-3 lô hàng
- Ngày hết hạn: 12-36 tháng từ hiện tại

### 9. Inventory Transactions (100 giao dịch kho)
- Loại: IMPORT (nhập), EXPORT (xuất)
- Thời gian: 2024 - 2025
- **referenceType và referenceId**: NULL (theo yêu cầu)
- Một số giao dịch xuất có ghi chú về treatment

### 10. Lab Partners (3 đối tác xét nghiệm)
- Phòng Xét Nghiệm Nha Khoa An Khang
- Trung Tâm Xét Nghiệm Nha Khoa Sài Gòn
- Phòng Lab Răng Hàm Mặt Hà Nội

### 11. Lab Orders (50 đơn xét nghiệm)
- Được tạo từ 50 treatment ngẫu nhiên
- Trạng thái: ORDERED, RECEIVED, INSTALLED
- Giá: 1,000,000 - 5,000,000 VNĐ

## Cách Sử Dụng

### Bước 1: Chuẩn Bị Database
Đảm bảo database MySQL đang chạy và được cấu hình trong `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/clinic_management
spring.datasource.username=root
spring.datasource.password=your_password
```

### Bước 2: Build Project
```bash
cd backend
mvn clean install
```

### Bước 3: Chạy Application
```bash
mvn spring-boot:run
```

Script sẽ tự động chạy khi application khởi động và tạo dữ liệu nếu database còn trống.

### Bước 4: Kiểm Tra Logs
Khi script chạy, bạn sẽ thấy các thông báo:
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
```

## Tính Năng Đặc Biệt

### 1. Dữ Liệu Tiếng Việt
- Tên người: Họ, tên đệm, tên thật tiếng Việt
- Địa chỉ: Các tỉnh thành Việt Nam
- Mô tả dịch vụ: Tiếng Việt

### 2. Số Điện Thoại Hợp Lệ
- Bắt đầu bằng 08 hoặc 09
- Đủ 10 chữ số

### 3. Thời Gian Phân Bố
- Treatment, Appointment, Payment: 2024 - 2025
- Phục vụ mục đích thống kê theo yêu cầu

### 4. Kịch Bản Thanh Toán Đa Dạng
- Thanh toán đủ một lần
- Thanh toán nhiều lần (trả hết)
- Thanh toán nhiều lần (còn nợ)

### 5. Tự Động Bỏ Qua Nếu Có Dữ Liệu
Script kiểm tra nếu đã có user trong database thì sẽ không tạo lại để tránh duplicate.

## Vô Hiệu Hóa Script

Nếu bạn không muốn script tự động chạy, có 2 cách:

### Cách 1: Xóa annotation @Component
Mở file `DataGenerator.java` và xóa dòng:
```java
@Component
```

### Cách 2: Đổi tên class
Đổi tên class từ `DataGenerator` sang tên khác.

## Đăng Nhập Vào Hệ Thống

Sau khi tạo dữ liệu, bạn có thể đăng nhập bằng các tài khoản:

**Chủ phòng khám:**
- SĐT: `0901234567`
- Mật khẩu: `123456`

**Nhân viên:**
- SĐT: `0912345678` / `0923456789` / `0934567890`
- Mật khẩu: `123456`

## Lưu Ý

1. Script chỉ chạy khi database trống (không có user nào)
2. Tất cả dữ liệu được tạo ngẫu nhiên
3. Thời gian được phân bố từ 2024-2025 để phục vụ thống kê
4. InventoryTransaction có referenceType và referenceId là NULL theo yêu cầu
5. Các mối quan hệ giữa các entity được đảm bảo hợp lệ

## Troubleshooting

### Lỗi: Database connection failed
- Kiểm tra MySQL đang chạy
- Kiểm tra thông tin kết nối trong `application.properties`

### Lỗi: Table doesn't exist
- Đảm bảo `spring.jpa.hibernate.ddl-auto=update` trong `application.properties`
- Hoặc chạy script SQL trong `database/schema.sql`

### Script không chạy
- Kiểm tra annotation `@Component` còn tồn tại
- Xem logs để biết lý do (có thể đã có dữ liệu)

## Liên Hệ

Nếu có vấn đề, vui lòng tạo issue trên GitHub repository.
