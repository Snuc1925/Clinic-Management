package com.hust.clinic.service;

import com.hust.clinic.dto.InventoryTransactionResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Item;
import com.hust.clinic.entity.ItemBatch;
import com.hust.clinic.entity.InventoryTransaction;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.InventoryTransactionRepository;
import com.hust.clinic.repository.ItemBatchRepository;
import com.hust.clinic.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InventoryTransactionServiceTest {

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private ItemBatchRepository itemBatchRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ClinicMembershipRepository clinicMembershipRepository;

    @InjectMocks
    private InventoryTransactionService inventoryTransactionService;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private Long batchId = 1L;
    private Long itemId = 1L;

    @BeforeEach
    void setUp() {
        // Setup will be done per test
    }

    @Test
    void testGetClinicTransactions_Success() {
        // Arrange
        ClinicMembership membership = new ClinicMembership();
        membership.setClinicId(clinicId);
        membership.setUserId(userId);
        membership.setStatus("accepted");

        InventoryTransaction transaction1 = new InventoryTransaction();
        transaction1.setId(1L);
        transaction1.setBatchId(batchId);
        transaction1.setType("IMPORT");
        transaction1.setQuantity(100);
        transaction1.setDoctorId(userId);
        transaction1.setReason("Nhập kho");
        transaction1.setTimestamp(LocalDateTime.now());

        InventoryTransaction transaction2 = new InventoryTransaction();
        transaction2.setId(2L);
        transaction2.setBatchId(batchId);
        transaction2.setType("EXPORT");
        transaction2.setQuantity(50);
        transaction2.setDoctorId(userId);
        transaction2.setReason("Xuất kho");
        transaction2.setTimestamp(LocalDateTime.now());

        ItemBatch batch = new ItemBatch();
        batch.setId(batchId);
        batch.setItemId(itemId);

        Item item = new Item();
        item.setId(itemId);
        item.setName("Paracetamol");
        item.setUnit("viên");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(membership));
        when(inventoryTransactionRepository.findByClinicId(clinicId))
                .thenReturn(Arrays.asList(transaction1, transaction2));
        when(itemBatchRepository.findById(batchId)).thenReturn(Optional.of(batch));
        when(itemRepository.findById(itemId)).thenReturn(Optional.of(item));

        // Act
        List<InventoryTransactionResponse> result = inventoryTransactionService.getClinicTransactions(clinicId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("IMPORT", result.get(0).getType());
        assertEquals("EXPORT", result.get(1).getType());
        assertEquals("Paracetamol", result.get(0).getItemName());
        assertEquals("viên", result.get(0).getItemUnit());
        verify(clinicMembershipRepository, times(1)).findByClinicIdAndUserId(clinicId, userId);
        verify(inventoryTransactionRepository, times(1)).findByClinicId(clinicId);
    }

    @Test
    void testGetClinicTransactions_UserNotMember() {
        // Arrange
        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            inventoryTransactionService.getClinicTransactions(clinicId, userId);
        });

        assertEquals("You are not a member of this clinic", exception.getMessage());
        verify(inventoryTransactionRepository, never()).findByClinicId(any());
    }

    @Test
    void testGetClinicTransactions_MembershipNotActive() {
        // Arrange
        ClinicMembership membership = new ClinicMembership();
        membership.setClinicId(clinicId);
        membership.setUserId(userId);
        membership.setStatus("pending");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(membership));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            inventoryTransactionService.getClinicTransactions(clinicId, userId);
        });

        assertEquals("Your membership is not active", exception.getMessage());
        verify(inventoryTransactionRepository, never()).findByClinicId(any());
    }

    @Test
    void testGetClinicTransactions_EmptyList() {
        // Arrange
        ClinicMembership membership = new ClinicMembership();
        membership.setClinicId(clinicId);
        membership.setUserId(userId);
        membership.setStatus("accepted");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(membership));
        when(inventoryTransactionRepository.findByClinicId(clinicId))
                .thenReturn(Arrays.asList());

        // Act
        List<InventoryTransactionResponse> result = inventoryTransactionService.getClinicTransactions(clinicId, userId);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
    }
}
