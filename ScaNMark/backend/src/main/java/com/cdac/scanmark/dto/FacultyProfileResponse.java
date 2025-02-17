package com.cdac.scanmark.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacultyProfileResponse {
    private String facultyCode ;
    private String department ;
    private String email ;
    private String name ;
}
