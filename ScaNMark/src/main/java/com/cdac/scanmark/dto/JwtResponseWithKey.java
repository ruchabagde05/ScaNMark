package com.cdac.scanmark.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponseWithKey {
    private String token;
    private String message;
    private String privateKey ;
}
