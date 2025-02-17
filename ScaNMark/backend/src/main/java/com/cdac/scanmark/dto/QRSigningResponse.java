package com.cdac.scanmark.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class QRSigningResponse {
    private String signedContent;
}