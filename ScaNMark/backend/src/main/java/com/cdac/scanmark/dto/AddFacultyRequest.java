package com.cdac.scanmark.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddFacultyRequest {
    private String facultyCode ;
    private String name ;
    private String email ;
    private String department ;
}
