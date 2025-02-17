package com.cdac.scanmark.dto;

import lombok.Data;

@Data
public class QRSigningRequest {
    private String lectureId;
    private String timestamp;
    private double latitude;
    private double longitude;
    private Long studentPrn;
}