package com.cdac.scanmark.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceRequest {
    private Long studentPrn;
    private String signedQrContent;
    private Double latitude;
    private Double longitude;
    private Long lectureId ;        
}

