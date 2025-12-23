package com.hust.clinic.service;

import com.hust.clinic.dto.ExportInventoryRequest;
import com.hust.clinic.dto.ImportBatchesRequest;
import com.hust.clinic.dto.ItemBatchRequest;
import com.hust.clinic.dto.ItemBatchResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Item;
import com.hust.clinic.entity.ItemBatch;
import com.hust.clinic.entity.InventoryTransaction;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.ItemBatchRepository;
import com.hust.clinic.repository.ItemRepository;
import com.hust.clinic.repository.InventoryTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ItemBatchServiceTest {

    @Mock
    private ItemBatchRepository itemBatchRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private ClinicMembershipRepository clinicMembershipRepository;

    @InjectMocks
    private ItemBatchService itemBatchService;

    private Long clinicId = 1L;
    private Long userId = 1L;
    private Long itemId = 1L;
    private Long batchId = 1L;

    private ClinicMembership activeMembership;
    private Item item;
    private ItemBatch batch;

    @BeforeEach
    void setUp() {
        activeMembership = new ClinicMembership();
        activeMembership.setClinicId(clinicId);
        activeMembership.setUserId(userId);
        activeMembership.setStatus("accepted");

        item = new Item();
        item.setId(itemId);
        item.setClinicId(clinicId);
        item.setName("Paracetamol");
        item.setUnit("viên");

        batch = new ItemBatch();
        batch.setId(batchId);
        batch.setItemId(itemId);
        batch.setQuantityImported(100);
        batch.setQuantityRemaining(100);
        batch.setUnitPrice(new java.math.BigDecimal("1000.0"));
    }

    @Test
    void testImportBatches_Success() {
        // Arrange
        ItemBatchRequest batchRequest = new ItemBatchRequest();
        batchRequest.setItemId(itemId);
        batchRequest.setQuantity(100);
        batchRequest.setUnitPrice(new java.math.BigDecimal("1000.0"));
        batchRequest.setExpiryDate(LocalDate.now().plusMonths(6));

        ImportBatchesRequest request = new ImportBatchesRequest();
        request.setBatches(Arrays.asList(batchRequest));

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(itemRepository.findByIdAndClinicId(itemId, clinicId))
                .thenReturn(Optional.of(item));
        when(itemBatchRepository.save(any(ItemBatch.class)))
                .thenReturn(batch);
        when(inventoryTransactionRepository.save(any(InventoryTransaction.class)))
                .thenReturn(new InventoryTransaction());

        // Act
        List<ItemBatchResponse> result = itemBatchService.importBatches(clinicId, userId, request);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(itemBatchRepository, times(1)).save(any(ItemBatch.class));
        verify(inventoryTransactionRepository, times(1)).save(any(InventoryTransaction.class));
    }

    @Test
    void testExportInventory_Success() {
        // Arrange
        ExportInventoryRequest request = new ExportInventoryRequest();
        request.setBatchId(batchId);
        request.setQuantity(50);
        request.setReason("Xuất kho thủ công");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(itemBatchRepository.findById(batchId))
                .thenReturn(Optional.of(batch));
        when(itemRepository.findById(itemId))
                .thenReturn(Optional.of(item));
        when(itemBatchRepository.save(any(ItemBatch.class)))
                .thenReturn(batch);
        when(inventoryTransactionRepository.save(any(InventoryTransaction.class)))
                .thenReturn(new InventoryTransaction());

        // Act
        itemBatchService.exportInventory(clinicId, userId, request);

        // Assert
        verify(itemBatchRepository, times(1)).save(any(ItemBatch.class));
        verify(inventoryTransactionRepository, times(1)).save(any(InventoryTransaction.class));
        assertEquals(50, batch.getQuantityRemaining());
    }

    @Test
    void testExportInventory_InsufficientQuantity() {
        // Arrange
        ExportInventoryRequest request = new ExportInventoryRequest();
        request.setBatchId(batchId);
        request.setQuantity(150); // More than available
        request.setReason("Xuất kho thủ công");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(itemBatchRepository.findById(batchId))
                .thenReturn(Optional.of(batch));
        when(itemRepository.findById(itemId))
                .thenReturn(Optional.of(item));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            itemBatchService.exportInventory(clinicId, userId, request);
        });

        assertEquals("Insufficient quantity in batch", exception.getMessage());
        verify(itemBatchRepository, never()).save(any(ItemBatch.class));
        verify(inventoryTransactionRepository, never()).save(any(InventoryTransaction.class));
    }

    @Test
    void testExportInventory_BatchNotFound() {
        // Arrange
        ExportInventoryRequest request = new ExportInventoryRequest();
        request.setBatchId(999L);
        request.setQuantity(50);
        request.setReason("Xuất kho thủ công");

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(itemBatchRepository.findById(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            itemBatchService.exportInventory(clinicId, userId, request);
        });

        assertEquals("Batch not found", exception.getMessage());
    }

    @Test
    void testExportInventory_WrongClinic() {
        // Arrange
        ExportInventoryRequest request = new ExportInventoryRequest();
        request.setBatchId(batchId);
        request.setQuantity(50);
        request.setReason("Xuất kho thủ công");

        Item wrongClinicItem = new Item();
        wrongClinicItem.setId(itemId);
        wrongClinicItem.setClinicId(999L); // Different clinic

        when(clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId))
                .thenReturn(Optional.of(activeMembership));
        when(itemBatchRepository.findById(batchId))
                .thenReturn(Optional.of(batch));
        when(itemRepository.findById(itemId))
                .thenReturn(Optional.of(wrongClinicItem));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            itemBatchService.exportInventory(clinicId, userId, request);
        });

        assertEquals("Batch does not belong to this clinic", exception.getMessage());
        verify(itemBatchRepository, never()).save(any(ItemBatch.class));
    }
}
