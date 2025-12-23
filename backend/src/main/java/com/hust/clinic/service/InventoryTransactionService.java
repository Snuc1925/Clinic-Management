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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryTransactionService {

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private ItemBatchRepository itemBatchRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public List<InventoryTransactionResponse> getClinicTransactions(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        return inventoryTransactionRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void verifyClinicMembership(Long clinicId, Long userId) {
        ClinicMembership membership = clinicMembershipRepository.findByClinicIdAndUserId(clinicId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this clinic"));

        if (!"accepted".equals(membership.getStatus())) {
            throw new RuntimeException("Your membership is not active");
        }
    }

    private InventoryTransactionResponse mapToResponse(InventoryTransaction transaction) {
        InventoryTransactionResponse response = new InventoryTransactionResponse();
        response.setId(transaction.getId());
        response.setBatchId(transaction.getBatchId());
        response.setType(transaction.getType());
        response.setQuantity(transaction.getQuantity());
        response.setReason(transaction.getReason());
        response.setTimestamp(transaction.getTimestamp());
        response.setCreatedAt(transaction.getCreatedAt());

        ItemBatch batch = itemBatchRepository.findById(transaction.getBatchId()).orElse(null);
        if (batch != null) {
            Item item = itemRepository.findById(batch.getItemId()).orElse(null);
            if (item != null) {
                response.setItemName(item.getName());
                response.setItemUnit(item.getUnit());
            }
        }

        return response;
    }
}
