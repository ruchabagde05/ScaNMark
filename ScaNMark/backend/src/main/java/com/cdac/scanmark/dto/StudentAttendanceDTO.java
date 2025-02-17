package com.cdac.scanmark.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentAttendanceDTO {
    private Long prn;
    private String name;
    private String todayAttendance;
    private double overallAttendance;
}
