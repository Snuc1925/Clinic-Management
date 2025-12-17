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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemBatchService {

    @Autowired
    private ItemBatchRepository itemBatchRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    @Transactional
    public List<ItemBatchResponse> importBatches(Long clinicId, Long userId, ImportBatchesRequest request) {
        verifyClinicMembership(clinicId, userId);

        List<ItemBatchResponse> responses = new ArrayList<>();

        for (ItemBatchRequest batchRequest : request.getBatches()) {
            Item item = itemRepository.findByIdAndClinicId(batchRequest.getItemId(), clinicId)
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            ItemBatch batch = new ItemBatch();
            batch.setItemId(batchRequest.getItemId());
            batch.setExpiryDate(batchRequest.getExpiryDate());
            batch.setQuantityImported(batchRequest.getQuantity());
            batch.setQuantityRemaining(batchRequest.getQuantity());
            batch.setUnitPrice(batchRequest.getUnitPrice());
            batch.setImportTime(LocalDateTime.now());

            ItemBatch saved = itemBatchRepository.save(batch);

            // Create import transaction
            InventoryTransaction transaction = new InventoryTransaction();
            transaction.setBatchId(saved.getId());
            transaction.setType("IMPORT");
            transaction.setQuantity(saved.getQuantityImported());
            transaction.setReferenceType("MANUAL");
            transaction.setTimestamp(LocalDateTime.now());
            inventoryTransactionRepository.save(transaction);

            responses.add(mapToResponse(saved));
        }

        return responses;
    }

    public List<ItemBatchResponse> getItemBatches(Long clinicId, Long itemId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        Item item = itemRepository.findByIdAndClinicId(itemId, clinicId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        return itemBatchRepository.findByItemId(itemId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ItemBatchResponse> getExpiringBatches(Long clinicId, Long userId, Integer daysAhead) {
        verifyClinicMembership(clinicId, userId);

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(daysAhead);

        return itemBatchRepository.findExpiringBatches(clinicId, startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void exportInventory(Long clinicId, Long userId, ExportInventoryRequest request) {
        verifyClinicMembership(clinicId, userId);

        ItemBatch batch = itemBatchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        Item item = itemRepository.findById(batch.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getClinicId().equals(clinicId)) {
            throw new RuntimeException("Batch does not belong to this clinic");
        }

        if (batch.getQuantityRemaining() < request.getQuantity()) {
            throw new RuntimeException("Insufficient quantity in batch");
        }

        // Update batch quantity
        batch.setQuantityRemaining(batch.getQuantityRemaining() - request.getQuantity());
        itemBatchRepository.save(batch);

        // Create export transaction
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setBatchId(batch.getId());
        transaction.setType("EXPORT");
        transaction.setQuantity(request.getQuantity());
        transaction.setReason(request.getReason());
        transaction.setReferenceType(request.getReferenceType());
        transaction.setReferenceId(request.getReferenceId());
        transaction.setTimestamp(LocalDateTime.now());
        inventoryTransactionRepository.save(transaction);
    }

    private void verifyClinicMembership(Long clinicId, Long userId) {
        ClinicMembership membership = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this clinic"));

        if (!"accepted".equals(membership.getStatus())) {
            throw new RuntimeException("Your membership is not active");
        }
    }

    private ItemBatchResponse mapToResponse(ItemBatch batch) {
        ItemBatchResponse response = new ItemBatchResponse();
        response.setId(batch.getId());
        response.setItemId(batch.getItemId());
        response.setExpiryDate(batch.getExpiryDate());
        response.setQuantityImported(batch.getQuantityImported());
        response.setQuantityRemaining(batch.getQuantityRemaining());
        response.setUnitPrice(batch.getUnitPrice());
        response.setImportTime(batch.getImportTime());
        response.setCreatedAt(batch.getCreatedAt());
        response.setUpdatedAt(batch.getUpdatedAt());

        Item item = itemRepository.findById(batch.getItemId()).orElse(null);
        if (item != null) {
            response.setItemName(item.getName());
            response.setItemUnit(item.getUnit());
        }

        return response;
    }
}
