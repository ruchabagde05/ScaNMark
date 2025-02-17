package com.cdac.scanmark.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateFacultyRequest {
    private String name ;
    private String email ;
    private String department ;
}
