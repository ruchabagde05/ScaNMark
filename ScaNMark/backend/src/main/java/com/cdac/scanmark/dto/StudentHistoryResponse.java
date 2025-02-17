package com.cdac.scanmark.dto;

import com.cdac.scanmark.entities.Attendance;
import com.cdac.scanmark.entities.Student;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentHistoryResponse {
    private Student student ;
    private List<Attendance> attendanceList ;
}
