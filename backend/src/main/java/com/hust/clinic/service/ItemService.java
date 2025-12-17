package com.hust.clinic.service;

import com.hust.clinic.dto.ItemRequest;
import com.hust.clinic.dto.ItemResponse;
import com.hust.clinic.entity.ClinicMembership;
import com.hust.clinic.entity.Item;
import com.hust.clinic.entity.ItemBatch;
import com.hust.clinic.repository.ClinicMembershipRepository;
import com.hust.clinic.repository.ItemBatchRepository;
import com.hust.clinic.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemBatchRepository itemBatchRepository;

    @Autowired
    private ClinicMembershipRepository clinicMembershipRepository;

    public ItemResponse createItem(Long clinicId, Long userId, ItemRequest request) {
        verifyClinicMembership(clinicId, userId);

        Item item = new Item();
        item.setClinicId(clinicId);
        item.setName(request.getName());
        item.setMinStockLevel(request.getMinStockLevel());
        item.setUnit(request.getUnit());

        Item saved = itemRepository.save(item);
        return mapToResponse(saved);
    }

    public List<ItemResponse> getClinicItems(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        return itemRepository.findByClinicId(clinicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse getItem(Long clinicId, Long itemId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        Item item = itemRepository.findByIdAndClinicId(itemId, clinicId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        return mapToResponse(item);
    }

    public ItemResponse updateItem(Long clinicId, Long itemId, Long userId, ItemRequest request) {
        verifyClinicMembership(clinicId, userId);

        Item item = itemRepository.findByIdAndClinicId(itemId, clinicId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setName(request.getName());
        item.setMinStockLevel(request.getMinStockLevel());
        item.setUnit(request.getUnit());

        Item updated = itemRepository.save(item);
        return mapToResponse(updated);
    }

    public void deleteItem(Long clinicId, Long itemId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        Item item = itemRepository.findByIdAndClinicId(itemId, clinicId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        itemRepository.delete(item);
    }

    public List<ItemResponse> getLowStockItems(Long clinicId, Long userId) {
        verifyClinicMembership(clinicId, userId);

        return itemRepository.findLowStockItems(clinicId)
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

    private ItemResponse mapToResponse(Item item) {
        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setClinicId(item.getClinicId());
        response.setName(item.getName());
        response.setMinStockLevel(item.getMinStockLevel());
        response.setUnit(item.getUnit());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());

        // Calculate total quantity from all batches
        Integer totalQuantity = itemBatchRepository.findByItemId(item.getId())
                .stream()
                .mapToInt(ItemBatch::getQuantityRemaining)
                .sum();
        response.setTotalQuantity(totalQuantity);

        return response;
    }
}
