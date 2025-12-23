package com.hust.clinic;

import com.hust.clinic.entity.*;
import com.hust.clinic.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DataGenerator implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ClinicRepository clinicRepository;
    
    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private TreatmentRepository treatmentRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private InventoryItemRepository inventoryItemRepository;
    
    @Autowired
    private ItemBatchRepository itemBatchRepository;
    
    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;
    
    @Autowired
    private LabPartnerRepository labPartnerRepository;
    
    @Autowired
    private LabOrderRepository labOrderRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    private Random random = new Random();

    // Vietnamese names data
    private static final String[] FIRST_NAMES = {
        "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng",
        "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Mai", "Đinh", "Trương", "Đào"
    };
    
    private static final String[] MIDDLE_NAMES = {
        "Văn", "Thị", "Hữu", "Đức", "Minh", "Hoài", "Quốc", "Bảo", "Anh", "Thanh",
        "Phương", "Thu", "Hải", "Kim", "Xuân", "Ngọc", "Công", "Thành", "Tuấn", "Hồng"
    };
    
    private static final String[] LAST_NAMES = {
        "An", "Bình", "Cường", "Dũng", "Giang", "Hà", "Hùng", "Khoa", "Linh", "Long",
        "Mai", "Nam", "Phong", "Quân", "Sơn", "Tâm", "Thảo", "Tuấn", "Tùng", "Vinh",
        "Yến", "Loan", "Hương", "Thư", "Chi", "Nga", "Hoa", "Nhung", "Trang", "Vân"
    };
    
    private static final String[] PROVINCES = {
        "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
        "Bình Dương", "Đồng Nai", "Khánh Hòa", "Nghệ An", "Thanh Hóa",
        "Thừa Thiên Huế", "Quảng Ninh", "Lâm Đồng", "Bà Rịa - Vũng Tàu", "Kiên Giang",
        "An Giang", "Bắc Ninh", "Hải Dương", "Nam Định", "Thái Nguyên"
    };

    private static final String[] TREATMENT_DESCRIPTIONS = {
        "Khám và điều trị sâu răng",
        "Lấy cao răng và tẩy trắng",
        "Nhổ răng khôn",
        "Trám răng composite",
        "Điều trị tủy răng",
        "Làm cầu răng sứ",
        "Niềng răng invisalign",
        "Cấy ghép implant",
        "Bọc răng sứ thẩm mỹ",
        "Chỉnh nha mắc cài kim loại",
        "Phục hồi răng bị mẻ",
        "Điều trị viêm nha chu",
        "Làm sạch và đánh bóng răng",
        "Nhổ răng sữa cho trẻ em",
        "Phục hồi răng bằng veneer"
    };

    private static final String[] APPOINTMENT_DESCRIPTIONS = {
        "Tái khám sau điều trị",
        "Khám tổng quát răng miệng",
        "Tư vấn niềng răng",
        "Kiểm tra răng định kỳ",
        "Thay dây niềng răng",
        "Tháo chỉ sau phẫu thuật",
        "Tư vấn cấy ghép implant",
        "Lịch hẹn làm răng sứ",
        "Kiểm tra sau trám răng",
        "Tư vấn chỉnh nha"
    };

    private static final String[] INVENTORY_ITEMS = {
        "Amalgam", "Composite A2", "Composite A3", "Xi măng GIC",
        "Gutta percha", "Kim nội nha", "Bông y tế", "Găng tay latex",
        "Khẩu trang y tế", "Mũi khoan răng số 2", "Mũi khoan răng số 4",
        "Lidocaine 2%", "Articaine 4%", "Máy siêu âm lấy cao răng",
        "Đèn quang trùng hợp", "Kẹp cầm máu", "Kéo phẫu thuật",
        "Chỉ khâu 4-0", "Dao mổ số 15", "Gương soi răng",
        "Thăm dò nha khoa", "Kềm nhổ răng", "Bình xịt nước",
        "Máy hút nước bọt", "Máy X-quang răng", "Vật liệu bọc răng sứ",
        "Dây niềng răng 0.16", "Mắc cài kim loại", "Mắc cài sứ", "Thuốc tê tại chỗ"
    };

    private static final String[] PAYMENT_METHODS = {
        "Tiền mặt", "Chuyển khoản", "Thẻ tín dụng", "Ví điện tử"
    };

    private static final String[] LAB_PARTNER_NAMES = {
        "Phòng Xét Nghiệm Nha Khoa An Khang",
        "Trung Tâm Xét Nghiệm Nha Khoa Sài Gòn",
        "Phòng Lab Răng Hàm Mặt Hà Nội"
    };

    private static final String[] INVENTORY_TRANSACTION_EXPORT_REASONS = {
        "Xuất dành cho treatment #%d",
        "Xuất vật tư điều trị cho bệnh nhân",
        "Sử dụng trong phẫu thuật",
        "Tiêu hao vật tư thường xuyên"
    };

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Bắt đầu tạo dữ liệu mẫu ===");

        // Check if data already exists
        if (userRepository.count() > 0) {
            System.out.println("Dữ liệu đã tồn tại. Bỏ qua việc tạo dữ liệu mẫu.");
            return;
        }

        // 1. Create Users
        System.out.println("1. Tạo users...");
        User owner = createUser("0901234567", "Nguyễn Văn Minh", "Hà Nội", LocalDate.of(1980, 5, 15));
        User staff1 = createUser("0912345678", "Trần Thị Hương", "Hồ Chí Minh", LocalDate.of(1985, 8, 20));
        User staff2 = createUser("0923456789", "Lê Quốc Hùng", "Đà Nẵng", LocalDate.of(1990, 3, 10));
        User staff3 = createUser("0934567890", "Phạm Thị Mai", "Hải Phòng", LocalDate.of(1988, 12, 25));

        // 2. Create Clinic
        System.out.println("2. Tạo phòng khám...");
        Clinic clinic = createClinic("Phòng Khám Nha Khoa Nụ Cười", "NK2024", owner.getId());

        // 3. Add staff to clinic
        System.out.println("3. Thêm nhân viên vào phòng khám...");
        createClinicMembership(clinic.getId(), owner.getId(), "active", "owner");
        createClinicMembership(clinic.getId(), staff1.getId(), "active", "staff");
        createClinicMembership(clinic.getId(), staff2.getId(), "active", "staff");
        createClinicMembership(clinic.getId(), staff3.getId(), "active", "staff");

        // 4. Create Patients
        System.out.println("4. Tạo 200 bệnh nhân...");
        List<Patient> patients = new ArrayList<>();
        for (int i = 0; i < 200; i++) {
            patients.add(createPatient(clinic.getId()));
        }

        // 5. Create Treatments (300 treatments spread across 2024-2025)
        System.out.println("5. Tạo 300 treatment...");
        List<User> doctors = Arrays.asList(owner, staff1, staff2, staff3);
        List<Treatment> treatments = new ArrayList<>();
        for (int i = 0; i < 300; i++) {
            Patient patient = patients.get(random.nextInt(patients.size()));
            User doctor = doctors.get(random.nextInt(doctors.size()));
            LocalDate treatmentDate = randomDateBetween(LocalDate.of(2024, 1, 1), LocalDate.of(2025, 12, 31));
            treatments.add(createTreatment(clinic.getId(), patient.getId(), doctor.getId(), treatmentDate));
        }

        // 6. Create Appointments (100 appointments spread across 2024-2025)
        System.out.println("6. Tạo 100 appointment...");
        for (int i = 0; i < 100; i++) {
            Patient patient = patients.get(random.nextInt(patients.size()));
            User doctor = doctors.get(random.nextInt(doctors.size()));
            LocalDateTime appointmentDate = randomDateTimeBetween(
                LocalDateTime.of(2024, 1, 1, 8, 0),
                LocalDateTime.of(2025, 12, 31, 18, 0)
            );
            createAppointment(clinic.getId(), patient.getId(), doctor.getId(), appointmentDate);
        }

        // 7. Create Payments (random payment scenarios)
        System.out.println("7. Tạo payment records...");
        for (Treatment treatment : treatments) {
            createPaymentsForTreatment(treatment);
        }

        // 8. Create Inventory Items
        System.out.println("8. Tạo 30 vật tư y tế...");
        List<InventoryItem> items = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            items.add(createInventoryItem(clinic.getId(), i));
        }

        // 9. Create Item Batches
        System.out.println("9. Tạo các lô hàng...");
        List<ItemBatch> batches = new ArrayList<>();
        for (InventoryItem item : items) {
            int numBatches = random.nextInt(3) + 1; // 1-3 batches per item
            for (int i = 0; i < numBatches; i++) {
                batches.add(createItemBatch(item.getId()));
            }
        }

        // 10. Create Inventory Transactions (100 transactions)
        System.out.println("10. Tạo 100 giao dịch kho...");
        for (int i = 0; i < 100; i++) {
            ItemBatch batch = batches.get(random.nextInt(batches.size()));
            User doctor = doctors.get(random.nextInt(doctors.size()));
            createInventoryTransaction(batch, doctor.getId(), treatments);
        }

        // 11. Create Lab Partners
        System.out.println("11. Tạo 3 lab partner...");
        List<LabPartner> labPartners = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            labPartners.add(createLabPartner(clinic.getId(), i));
        }

        // 12. Create Lab Orders (50 orders from selected treatments)
        System.out.println("12. Tạo 50 lab order...");
        Collections.shuffle(treatments);
        List<Treatment> selectedTreatments = treatments.subList(0, Math.min(50, treatments.size()));
        for (Treatment treatment : selectedTreatments) {
            LabPartner partner = labPartners.get(random.nextInt(labPartners.size()));
            createLabOrder(treatment, partner.getId());
        }

        System.out.println("=== Hoàn thành tạo dữ liệu mẫu ===");
        System.out.println("- Số lượng Users: " + userRepository.count());
        System.out.println("- Số lượng Clinics: " + clinicRepository.count());
        System.out.println("- Số lượng Patients: " + patientRepository.count());
        System.out.println("- Số lượng Treatments: " + treatmentRepository.count());
        System.out.println("- Số lượng Appointments: " + appointmentRepository.count());
        System.out.println("- Số lượng Payments: " + paymentRepository.count());
        System.out.println("- Số lượng Inventory Items: " + inventoryItemRepository.count());
        System.out.println("- Số lượng Item Batches: " + itemBatchRepository.count());
        System.out.println("- Số lượng Inventory Transactions: " + inventoryTransactionRepository.count());
        System.out.println("- Số lượng Lab Partners: " + labPartnerRepository.count());
        System.out.println("- Số lượng Lab Orders: " + labOrderRepository.count());
    }

    private User createUser(String phone, String fullName, String address, LocalDate dateOfBirth) {
        User user = new User();
        user.setPhone(phone);
        user.setFullName(fullName);
        user.setAddress(address);
        user.setDateOfBirth(dateOfBirth);
        user.setPassword(passwordEncoder.encode("123456"));
        return userRepository.save(user);
    }

    private Clinic createClinic(String name, String code, Long ownerId) {
        Clinic clinic = new Clinic();
        clinic.setName(name);
        clinic.setCode(code);
        clinic.setOwnerId(ownerId);
        return clinicRepository.save(clinic);
    }

    private void createClinicMembership(Long clinicId, Long userId, String status, String role) {
        ClinicMembership membership = new ClinicMembership();
        membership.setClinicId(clinicId);
        membership.setUserId(userId);
        membership.setStatus(status);
        membership.setRole(role);
        clinicMembershipRepository.save(membership);
    }

    private Patient createPatient(Long clinicId) {
        Patient patient = new Patient();
        patient.setClinicId(clinicId);
        patient.setPhone(generateVietnamesePhone());
        patient.setFullName(generateVietnameseName());
        patient.setAddress(generateVietnameseAddress());
        patient.setDateOfBirth(randomDateBetween(LocalDate.of(1950, 1, 1), LocalDate.of(2015, 12, 31)));
        patient.setNote("Bệnh nhân đăng ký khám");
        return patientRepository.save(patient);
    }

    private Treatment createTreatment(Long clinicId, Long patientId, Long doctorId, LocalDate date) {
        Treatment treatment = new Treatment();
        treatment.setClinicId(clinicId);
        treatment.setPatientId(patientId);
        treatment.setDoctorId(doctorId);
        treatment.setDate(date);
        treatment.setDescription(TREATMENT_DESCRIPTIONS[random.nextInt(TREATMENT_DESCRIPTIONS.length)]);
        treatment.setTotalPayment(BigDecimal.valueOf(500000 + random.nextInt(9500000))); // 500k - 10M VND
        return treatmentRepository.save(treatment);
    }

    private void createAppointment(Long clinicId, Long patientId, Long doctorId, LocalDateTime appointmentDate) {
        Appointment appointment = new Appointment();
        appointment.setClinicId(clinicId);
        appointment.setPatientId(patientId);
        appointment.setDoctorId(doctorId);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setDescription(APPOINTMENT_DESCRIPTIONS[random.nextInt(APPOINTMENT_DESCRIPTIONS.length)]);
        
        String[] statuses = {"scheduled", "completed", "cancelled"};
        appointment.setStatus(statuses[random.nextInt(statuses.length)]);
        
        appointmentRepository.save(appointment);
    }

    private void createPaymentsForTreatment(Treatment treatment) {
        BigDecimal totalAmount = treatment.getTotalPayment();
        int scenario = random.nextInt(3);
        
        if (scenario == 0) {
            // Scenario 1: Pay in full at once
            Payment payment = new Payment();
            payment.setTreatmentId(treatment.getId());
            payment.setAmount(totalAmount);
            payment.setPaymentDate(treatment.getDate().plusDays(random.nextInt(7)));
            payment.setPaymentMethod(PAYMENT_METHODS[random.nextInt(PAYMENT_METHODS.length)]);
            payment.setNotes("Thanh toán toàn bộ");
            paymentRepository.save(payment);
        } else if (scenario == 1) {
            // Scenario 2: Pay in multiple installments (fully paid)
            int numPayments = random.nextInt(3) + 2; // 2-4 payments
            BigDecimal remaining = totalAmount;
            LocalDate paymentDate = treatment.getDate();
            
            for (int i = 0; i < numPayments; i++) {
                Payment payment = new Payment();
                payment.setTreatmentId(treatment.getId());
                
                if (i == numPayments - 1) {
                    payment.setAmount(remaining);
                } else {
                    BigDecimal amount = totalAmount.divide(BigDecimal.valueOf(numPayments), 0, BigDecimal.ROUND_DOWN);
                    payment.setAmount(amount);
                    remaining = remaining.subtract(amount);
                }
                
                paymentDate = paymentDate.plusDays(random.nextInt(30) + 15);
                payment.setPaymentDate(paymentDate);
                payment.setPaymentMethod(PAYMENT_METHODS[random.nextInt(PAYMENT_METHODS.length)]);
                payment.setNotes("Thanh toán lần " + (i + 1));
                paymentRepository.save(payment);
            }
        } else {
            // Scenario 3: Pay in installments but still have debt
            int numPayments = random.nextInt(2) + 1; // 1-2 payments
            BigDecimal paidAmount = totalAmount.multiply(BigDecimal.valueOf(0.3 + random.nextDouble() * 0.5)); // Pay 30-80%
            LocalDate paymentDate = treatment.getDate();
            
            if (numPayments == 1) {
                Payment payment = new Payment();
                payment.setTreatmentId(treatment.getId());
                payment.setAmount(paidAmount);
                payment.setPaymentDate(paymentDate.plusDays(random.nextInt(7)));
                payment.setPaymentMethod(PAYMENT_METHODS[random.nextInt(PAYMENT_METHODS.length)]);
                payment.setNotes("Thanh toán một phần, còn nợ");
                paymentRepository.save(payment);
            } else {
                BigDecimal firstPayment = paidAmount.multiply(BigDecimal.valueOf(0.6));
                BigDecimal secondPayment = paidAmount.subtract(firstPayment);
                
                Payment payment1 = new Payment();
                payment1.setTreatmentId(treatment.getId());
                payment1.setAmount(firstPayment);
                payment1.setPaymentDate(paymentDate.plusDays(random.nextInt(7)));
                payment1.setPaymentMethod(PAYMENT_METHODS[random.nextInt(PAYMENT_METHODS.length)]);
                payment1.setNotes("Thanh toán lần 1");
                paymentRepository.save(payment1);
                
                Payment payment2 = new Payment();
                payment2.setTreatmentId(treatment.getId());
                payment2.setAmount(secondPayment);
                payment2.setPaymentDate(paymentDate.plusDays(random.nextInt(30) + 15));
                payment2.setPaymentMethod(PAYMENT_METHODS[random.nextInt(PAYMENT_METHODS.length)]);
                payment2.setNotes("Thanh toán lần 2, vẫn còn nợ");
                paymentRepository.save(payment2);
            }
        }
    }

    private InventoryItem createInventoryItem(Long clinicId, int index) {
        InventoryItem item = new InventoryItem();
        item.setClinicId(clinicId);
        item.setName(INVENTORY_ITEMS[index % INVENTORY_ITEMS.length]);
        item.setDescription("Vật tư y tế chất lượng cao");
        
        String[] categories = {"MEDICINE", "SUPPLY", "EQUIPMENT"};
        item.setCategory(categories[index % 3]);
        
        item.setQuantity(random.nextInt(500) + 100);
        item.setMinimumStockLevel(50);
        item.setUnitPrice(BigDecimal.valueOf(10000 + random.nextInt(990000)));
        item.setExpiryDate(LocalDate.now().plusMonths(random.nextInt(24) + 12));
        item.setNotes("Vật tư nhập khẩu");
        
        return inventoryItemRepository.save(item);
    }

    private ItemBatch createItemBatch(Long itemId) {
        ItemBatch batch = new ItemBatch();
        batch.setItemId(itemId);
        batch.setExpiryDate(LocalDate.now().plusMonths(random.nextInt(24) + 12));
        
        int quantity = random.nextInt(200) + 50;
        batch.setQuantityImported(quantity);
        batch.setQuantityRemaining(quantity - random.nextInt(Math.min(50, quantity)));
        batch.setUnitPrice(BigDecimal.valueOf(10000 + random.nextInt(990000)));
        batch.setImportTime(randomDateTimeBetween(
            LocalDateTime.of(2023, 1, 1, 0, 0),
            LocalDateTime.now()
        ));
        
        return itemBatchRepository.save(batch);
    }

    private void createInventoryTransaction(ItemBatch batch, Long doctorId, List<Treatment> treatments) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setBatchId(batch.getId());
        
        String[] types = {"IMPORT", "EXPORT"};
        String type = types[random.nextInt(types.length)];
        transaction.setType(type);
        
        int maxQuantity = type.equals("IMPORT") ? 200 : Math.min(50, batch.getQuantityRemaining());
        transaction.setQuantity(random.nextInt(Math.max(1, maxQuantity)) + 1);
        transaction.setDoctorId(doctorId);
        
        if (type.equals("EXPORT")) {
            // Some export transactions reference treatments
            if (random.nextDouble() < 0.3 && !treatments.isEmpty()) {
                Treatment treatment = treatments.get(random.nextInt(treatments.size()));
                transaction.setReason(String.format(INVENTORY_TRANSACTION_EXPORT_REASONS[0], treatment.getId()));
            } else {
                transaction.setReason(INVENTORY_TRANSACTION_EXPORT_REASONS[random.nextInt(INVENTORY_TRANSACTION_EXPORT_REASONS.length)]);
            }
        } else {
            transaction.setReason("Nhập hàng từ nhà cung cấp");
        }
        
        // Set referenceType and referenceId to NULL as requested
        transaction.setReferenceType(null);
        transaction.setReferenceId(null);
        
        transaction.setTimestamp(randomDateTimeBetween(
            LocalDateTime.of(2024, 1, 1, 0, 0),
            LocalDateTime.of(2025, 12, 31, 23, 59)
        ));
        
        inventoryTransactionRepository.save(transaction);
    }

    private LabPartner createLabPartner(Long clinicId, int index) {
        LabPartner partner = new LabPartner();
        partner.setClinicId(clinicId);
        partner.setName(LAB_PARTNER_NAMES[index]);
        partner.setPhone(generateVietnamesePhone());
        partner.setAddress(generateVietnameseAddress());
        return labPartnerRepository.save(partner);
    }

    private void createLabOrder(Treatment treatment, Long labPartnerId) {
        LabOrder order = new LabOrder();
        order.setTreatmentId(treatment.getId());
        order.setLabPartnerId(labPartnerId);
        order.setDoctorId(treatment.getDoctorId());
        
        String[] statuses = {"ORDERED", "RECEIVED", "INSTALLED"};
        order.setStatus(statuses[random.nextInt(statuses.length)]);
        
        order.setPrice(BigDecimal.valueOf(1000000 + random.nextInt(4000000))); // 1M - 5M VND
        order.setDescription("Làm răng sứ Cercon, màu A2");
        order.setDeliveryDate(treatment.getDate().plusDays(random.nextInt(14) + 7));
        
        labOrderRepository.save(order);
    }

    // Helper methods
    private String generateVietnameseName() {
        String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
        String middleName = MIDDLE_NAMES[random.nextInt(MIDDLE_NAMES.length)];
        String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
        return firstName + " " + middleName + " " + lastName;
    }

    private String generateVietnameseAddress() {
        String province = PROVINCES[random.nextInt(PROVINCES.length)];
        int streetNumber = random.nextInt(500) + 1;
        String[] streetNames = {"Lê Lợi", "Trần Hưng Đạo", "Nguyễn Huệ", "Hai Bà Trưng", 
                                "Võ Văn Tần", "Phan Chu Trinh", "Điện Biên Phủ"};
        String street = streetNames[random.nextInt(streetNames.length)];
        return streetNumber + " " + street + ", " + province;
    }

    private String generateVietnamesePhone() {
        String prefix = random.nextBoolean() ? "09" : "08";
        StringBuilder phone = new StringBuilder(prefix);
        for (int i = 0; i < 8; i++) {
            phone.append(random.nextInt(10));
        }
        return phone.toString();
    }

    private LocalDate randomDateBetween(LocalDate start, LocalDate end) {
        long startEpochDay = start.toEpochDay();
        long endEpochDay = end.toEpochDay();
        long randomDay = startEpochDay + random.nextInt((int) (endEpochDay - startEpochDay + 1));
        return LocalDate.ofEpochDay(randomDay);
    }

    private LocalDateTime randomDateTimeBetween(LocalDateTime start, LocalDateTime end) {
        long startSecond = start.toLocalDate().toEpochDay() * 86400 + start.toLocalTime().toSecondOfDay();
        long endSecond = end.toLocalDate().toEpochDay() * 86400 + end.toLocalTime().toSecondOfDay();
        long randomSecond = startSecond + (long) (random.nextDouble() * (endSecond - startSecond));
        
        LocalDate date = LocalDate.ofEpochDay(randomSecond / 86400);
        int secondOfDay = (int) (randomSecond % 86400);
        return LocalDateTime.of(date, java.time.LocalTime.ofSecondOfDay(secondOfDay));
    }
}
