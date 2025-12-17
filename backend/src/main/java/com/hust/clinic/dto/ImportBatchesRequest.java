package com.hust.clinic.dto;

import java.util.List;

public class ImportBatchesRequest {
    private List<ItemBatchRequest> batches;

    public ImportBatchesRequest() {
    }

    public ImportBatchesRequest(List<ItemBatchRequest> batches) {
        this.batches = batches;
    }

    public List<ItemBatchRequest> getBatches() {
        return batches;
    }

    public void setBatches(List<ItemBatchRequest> batches) {
        this.batches = batches;
    }
}
