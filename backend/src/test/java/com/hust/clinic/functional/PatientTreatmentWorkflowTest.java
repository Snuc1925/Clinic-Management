package com.hust.clinic.functional;

import com.hust.clinic.dto.PatientRequest;
import com.hust.clinic.dto.PatientResponse;
import com.hust.clinic.dto.TreatmentRequest;
import com.hust.clinic.dto.TreatmentResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.repository.*;
import com.hust.clinic.service.PatientService;
import com.hust.clinic.service.TreatmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Functional End-to-End Tests for Patient and Treatment Workflow
 * Kiểm thử chức năng toàn diện: Quy trình quản lý bệnh nhân và điều trị
 * Tests complete workflows from patient creation to treatment management
 */
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class PatientTreatmentWorkflowTest {

    @Autowired
    private PatientService patientService;

    @Autowired
    private TreatmentService treatmentService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private ClinicMembershipRepository membershipRepository;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private ClinicMembership membership;

    @BeforeEach
    void setUp() {
        treatmentRepository.deleteAll();
        patientRepository.deleteAll();
        membershipRepository.deleteAll();

        // Create active doctor membership
        membership = new ClinicMembership();
        membership.setClinicId(clinicId);
        membership.setUserId(userId);
        membership.setStatus("accepted");
        membership.setRole("DOCTOR");
        membership = membershipRepository.save(membership);
    }

    @Test
    void testCompletePatientJourney_CreateUpdateTreatDelete() {
        // Bước 1: Tạo bệnh nhân mới
        PatientRequest createPatientRequest = new PatientRequest();
        createPatientRequest.setPhone("0123456789");
        createPatientRequest.setFullName("Nguyen Van An");
        createPatientRequest.setAddress("123 Nguyen Trai, Thanh Xuan, Ha Noi");
        createPatientRequest.setDateOfBirth(LocalDate.of(1985, 3, 15));
        createPatientRequest.setNote("Benh nhan lan dau kham");

        PatientResponse patient = patientService.createPatient(clinicId, userId, createPatientRequest);
        assertNotNull(patient);
        assertNotNull(patient.getId());
        assertEquals("Nguyen Van An", patient.getFullName());

        // Bước 2: Cập nhật thông tin bệnh nhân
        PatientRequest updatePatientRequest = new PatientRequest();
        updatePatientRequest.setPhone("0987654321");
        updatePatientRequest.setFullName("Nguyen Van An - Da cap nhat");
        updatePatientRequest.setAddress("456 Cau Giay, Ha Noi");
        updatePatientRequest.setDateOfBirth(LocalDate.of(1985, 3, 15));
        updatePatientRequest.setNote("Cap nhat dia chi");

        PatientResponse updatedPatient = patientService.updatePatient(
                clinicId, patient.getId(), userId, updatePatientRequest);
        assertEquals("Nguyen Van An - Da cap nhat", updatedPatient.getFullName());

        // Bước 3: Tạo điều trị cho bệnh nhân
        TreatmentRequest treatment1Request = new TreatmentRequest();
        treatment1Request.setPatientId(patient.getId());
        treatment1Request.setDate(LocalDate.now());
        treatment1Request.setDescription("Kham va dieu tri cam cum");
        treatment1Request.setTotalPayment(new BigDecimal("500000"));

        TreatmentResponse treatment1 = treatmentService.createTreatment(
                clinicId, userId, treatment1Request);
        assertNotNull(treatment1);
        assertEquals("Kham va dieu tri cam cum", treatment1.getDescription());

        // Bước 4: Tạo điều trị thứ hai cho cùng bệnh nhân
        TreatmentRequest treatment2Request = new TreatmentRequest();
        treatment2Request.setPatientId(patient.getId());
        treatment2Request.setDate(LocalDate.now().plusDays(7));
        treatment2Request.setDescription("Tai kham va kiem tra suc khoe");
        treatment2Request.setTotalPayment(new BigDecimal("300000"));

        TreatmentResponse treatment2 = treatmentService.createTreatment(
                clinicId, userId, treatment2Request);
        assertNotNull(treatment2);

        // Bước 5: Kiểm tra danh sách điều trị
        List<TreatmentResponse> treatments = treatmentService.getClinicTreatments(clinicId, userId);
        assertTrue(treatments.size() >= 2);

        // Bước 6: Xóa bệnh nhân
        patientService.deletePatient(clinicId, patient.getId(), userId);
        
        // Verify patient is deleted
        assertFalse(patientRepository.findById(patient.getId()).isPresent());
    }

    @Test
    void testMultiplePatientsWithDifferentTreatments() {
        // Tạo nhiều bệnh nhân
        PatientResponse patient1 = createPatient("Tran Thi B", "0111111111");
        PatientResponse patient2 = createPatient("Le Van C", "0222222222");
        PatientResponse patient3 = createPatient("Pham Thi D", "0333333333");

        // Tạo điều trị cho từng bệnh nhân
        createTreatment(patient1.getId(), "Dieu tri viem hong", new BigDecimal("400000"));
        createTreatment(patient1.getId(), "Tai kham", new BigDecimal("200000"));
        
        createTreatment(patient2.getId(), "Kham tong quat", new BigDecimal("800000"));
        
        createTreatment(patient3.getId(), "Dieu tri dau bung", new BigDecimal("600000"));
        createTreatment(patient3.getId(), "Xet nghiem mau", new BigDecimal("150000"));
        createTreatment(patient3.getId(), "Tai kham", new BigDecimal("200000"));

        // Kiểm tra tổng số bệnh nhân
        List<PatientResponse> allPatients = patientService.getClinicPatients(clinicId, userId);
        assertEquals(3, allPatients.size());

        // Kiểm tra tổng số điều trị
        List<TreatmentResponse> allTreatments = treatmentService.getClinicTreatments(clinicId, userId);
        assertEquals(6, allTreatments.size());
    }

    @Test
    void testPatientLifecycle_FromRegistrationToMultipleTreatments() {
        // Đăng ký bệnh nhân mới
        PatientRequest newPatient = new PatientRequest();
        newPatient.setPhone("0999888777");
        newPatient.setFullName("Hoang Van E");
        newPatient.setAddress("789 Dong Da, Ha Noi");
        newPatient.setDateOfBirth(LocalDate.of(1992, 7, 20));
        newPatient.setNote("Benh nhan VIP");

        PatientResponse patient = patientService.createPatient(clinicId, userId, newPatient);

        // Tạo chuỗi điều trị liên tục
        BigDecimal totalCost = BigDecimal.ZERO;
        
        // Lần khám 1
        TreatmentResponse t1 = createTreatment(
                patient.getId(), 
                "Kham suc khoe tong quat", 
                new BigDecimal("1000000")
        );
        totalCost = totalCost.add(new BigDecimal("1000000"));

        // Lần khám 2
        TreatmentResponse t2 = createTreatment(
                patient.getId(), 
                "Dieu tri theo ket qua xet nghiem", 
                new BigDecimal("1500000")
        );
        totalCost = totalCost.add(new BigDecimal("1500000"));

        // Lần khám 3
        TreatmentResponse t3 = createTreatment(
                patient.getId(), 
                "Tai kham va danh gia ket qua", 
                new BigDecimal("500000")
        );
        totalCost = totalCost.add(new BigDecimal("500000"));

        // Kiểm tra tổng chi phí
        assertEquals(new BigDecimal("3000000"), totalCost);

        // Xác minh tất cả điều trị đều tồn tại
        TreatmentResponse retrieved1 = treatmentService.getTreatment(clinicId, t1.getId(), userId);
        TreatmentResponse retrieved2 = treatmentService.getTreatment(clinicId, t2.getId(), userId);
        TreatmentResponse retrieved3 = treatmentService.getTreatment(clinicId, t3.getId(), userId);

        assertNotNull(retrieved1);
        assertNotNull(retrieved2);
        assertNotNull(retrieved3);
    }

    @Test
    void testPatientNotFound_ThrowsException() {
        // Thử tạo điều trị cho bệnh nhân không tồn tại
        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(99999L);
        request.setDate(LocalDate.now());
        request.setDescription("Test");
        request.setTotalPayment(new BigDecimal("100000"));

        assertThrows(RuntimeException.class, () -> {
            treatmentService.createTreatment(clinicId, userId, request);
        });
    }

    // Helper methods
    private PatientResponse createPatient(String fullName, String phone) {
        PatientRequest request = new PatientRequest();
        request.setFullName(fullName);
        request.setPhone(phone);
        request.setAddress("Ha Noi");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));
        request.setNote("Test patient");
        return patientService.createPatient(clinicId, userId, request);
    }

    private TreatmentResponse createTreatment(Long patientId, String description, BigDecimal amount) {
        TreatmentRequest request = new TreatmentRequest();
        request.setPatientId(patientId);
        request.setDate(LocalDate.now());
        request.setDescription(description);
        request.setTotalPayment(amount);
        return treatmentService.createTreatment(clinicId, userId, request);
    }
}
