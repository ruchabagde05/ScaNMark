package com.cdac.scanmark.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddStudentRequest {
    private Long prn;
    private String name;
    private String email;
}
