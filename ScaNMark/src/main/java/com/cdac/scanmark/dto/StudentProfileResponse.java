package com.cdac.scanmark.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentProfileResponse {
    private Long prn ;
    private String email ;
    private String macAddress ;
    private String name ;
}
