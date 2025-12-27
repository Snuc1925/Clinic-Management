package com.hust.clinic.service;

import com.hust.clinic.dto.LabOrderRequest;
import com.hust.clinic.dto.LabOrderResponse;
import com.hust.clinic.dto.UpdateLabOrderStatusRequest;
import com.hust.clinic.entity.*;
import com.hust.clinic.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LabOrderServiceTest {

    @Mock
    private LabOrderRepository labOrderRepository;

    @Mock
    private TreatmentRepository treatmentRepository;

    @Mock
    private LabPartnerRepository labPartnerRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClinicMembershipRepository clinicMembershipRepository;

    @InjectMocks
    private LabOrderService labOrderService;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private Long treatmentId = 1L;
    private Long labPartnerId = 1L;
    private Long labOrderId = 1L;
    private Long patientId = 1L;

    private ClinicMembership activeMembership;
    private Treatment testTreatment;
    private LabPartner testLabPartner;
    private LabOrder testLabOrder;
    private Patient testPatient;
    private User testDoctor;

    @BeforeEach
    void setUp() {
        activeMembership = new ClinicMembership();
        activeMembership.setClinicId(clinicId);
        activeMembership.setUserId(userId);
        activeMembership.setStatus("accepted");

        testTreatment = new Treatment();
        testTreatment.setId(treatmentId);
        testTreatment.setClinicId(clinicId);
        testTreatment.setPatientId(patientId);
        testTreatment.setDoctorId(userId);
        testTreatment.setTotalPayment(new BigDecimal("1000000"));

        testLabPartner = new LabPartner();
        testLabPartner.setId(labPartnerId);
        testLabPartner.setClinicId(clinicId);
        testLabPartner.setName("Test Lab");
        testLabPartner.setAddress("123 Lab St");
        testLabPartner.setPhone("0123456789");

        testPatient = new Patient();
        testPatient.setId(patientId);
        testPatient.setClinicId(clinicId);
        testPatient.setFullName("Test Patient");

        testDoctor = new User();
        testDoctor.setId(userId);
        testDoctor.setFullName("Dr. Test");

        testLabOrder = new LabOrder();
        testLabOrder.setId(labOrderId);
        testLabOrder.setTreatmentId(treatmentId);
        testLabOrder.setLabPartnerId(labPartnerId);
        testLabOrder.setDoctorId(userId);
        testLabOrder.setStatus("ORDERED");
        testLabOrder.setPrice(new BigDecimal("500000"));
        testLabOrder.setDescription("Blood test");
        testLabOrder.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testCreateLabOrder_Success() {
        // Arrange
        LabOrderRequest request = new LabOrderRequest();
        request.setTreatmentId(treatmentId);
        request.setLabPartnerId(labPartnerId);
        request.setPrice(new BigDecimal("300000"));
        request.setDescription("X-ray scan");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(treatmentRepository.findByIdAndClinicId(treatmentId, clinicId))
                .thenReturn(Optional.of(testTreatment));
        when(labPartnerRepository.findByIdAndClinicId(labPartnerId, clinicId))
                .thenReturn(Optional.of(testLabPartner));
        when(labOrderRepository.save(any(LabOrder.class)))
                .thenReturn(testLabOrder);
        when(treatmentRepository.findById(treatmentId)).thenReturn(Optional.of(testTreatment));
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(labPartnerRepository.findById(labPartnerId)).thenReturn(Optional.of(testLabPartner));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));

        // Act
        LabOrderResponse result = labOrderService.createLabOrder(clinicId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(labOrderId, result.getId());
        assertEquals("Test Lab", result.getLabPartnerName());
        assertEquals("Test Patient", result.getPatientName());
        verify(labOrderRepository, times(1)).save(any(LabOrder.class));
    }

    @Test
    void testCreateLabOrder_TreatmentNotFound() {
        // Arrange
        LabOrderRequest request = new LabOrderRequest();
        request.setTreatmentId(999L);
        request.setLabPartnerId(labPartnerId);
        request.setPrice(new BigDecimal("100000"));

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(treatmentRepository.findByIdAndClinicId(999L, clinicId))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            labOrderService.createLabOrder(clinicId, userId, request);
        });

        assertEquals("Treatment not found", exception.getMessage());
        verify(labOrderRepository, never()).save(any(LabOrder.class));
    }

    @Test
    void testGetClinicLabOrders_Success() {
        // Arrange
        LabOrder labOrder2 = new LabOrder();
        labOrder2.setId(2L);
        labOrder2.setTreatmentId(treatmentId);
        labOrder2.setLabPartnerId(labPartnerId);
        labOrder2.setDoctorId(userId);
        labOrder2.setStatus("DELIVERED");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(labOrderRepository.findByClinicId(clinicId))
                .thenReturn(Arrays.asList(testLabOrder, labOrder2));
        when(treatmentRepository.findById(treatmentId)).thenReturn(Optional.of(testTreatment));
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(labPartnerRepository.findById(labPartnerId)).thenReturn(Optional.of(testLabPartner));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));

        // Act
        List<LabOrderResponse> result = labOrderService.getClinicLabOrders(clinicId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(labOrderRepository, times(1)).findByClinicId(clinicId);
    }

    @Test
    void testUpdateLabOrderStatus_Success() {
        // Arrange
        UpdateLabOrderStatusRequest request = new UpdateLabOrderStatusRequest();
        request.setStatus("IN_PROGRESS");
        request.setDeliveryDate(LocalDate.now().plusDays(3));

        when(labOrderRepository.findById(labOrderId))
                .thenReturn(Optional.of(testLabOrder));
        when(labOrderRepository.save(any(LabOrder.class)))
                .thenReturn(testLabOrder);
        when(treatmentRepository.findById(treatmentId)).thenReturn(Optional.of(testTreatment));
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(labPartnerRepository.findById(labPartnerId)).thenReturn(Optional.of(testLabPartner));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testDoctor));

        // Act
        LabOrderResponse result = labOrderService.updateLabOrderStatus(labOrderId, request);

        // Assert
        assertNotNull(result);
        assertEquals("IN_PROGRESS", testLabOrder.getStatus());
        verify(labOrderRepository, times(1)).save(testLabOrder);
    }

    @Test
    void testDeleteLabOrder_Success() {
        // Arrange
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(labOrderRepository.findById(labOrderId))
                .thenReturn(Optional.of(testLabOrder));
        when(treatmentRepository.findById(treatmentId))
                .thenReturn(Optional.of(testTreatment));
        doNothing().when(labOrderRepository).delete(testLabOrder);

        // Act
        labOrderService.deleteLabOrder(clinicId, labOrderId, userId);

        // Assert
        verify(labOrderRepository, times(1)).delete(testLabOrder);
    }

    @Test
    void testCreateLabOrder_LabPartnerNotFound() {
        // Arrange
        LabOrderRequest request = new LabOrderRequest();
        request.setTreatmentId(treatmentId);
        request.setLabPartnerId(999L);
        request.setPrice(new BigDecimal("100000"));

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(treatmentRepository.findByIdAndClinicId(treatmentId, clinicId))
                .thenReturn(Optional.of(testTreatment));
        when(labPartnerRepository.findByIdAndClinicId(999L, clinicId))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            labOrderService.createLabOrder(clinicId, userId, request);
        });

        assertEquals("Lab partner not found", exception.getMessage());
        verify(labOrderRepository, never()).save(any(LabOrder.class));
    }
}
