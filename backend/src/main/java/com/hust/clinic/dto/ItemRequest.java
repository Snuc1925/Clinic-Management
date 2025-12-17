package com.hust.clinic.dto;

public class ItemRequest {
    private String name;
    private Integer minStockLevel;
    private String unit;

    public ItemRequest() {
    }

    public ItemRequest(String name, Integer minStockLevel, String unit) {
        this.name = name;
        this.minStockLevel = minStockLevel;
        this.unit = unit;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getMinStockLevel() {
        return minStockLevel;
    }

    public void setMinStockLevel(Integer minStockLevel) {
        this.minStockLevel = minStockLevel;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
