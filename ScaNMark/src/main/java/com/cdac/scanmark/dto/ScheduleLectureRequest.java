package com.cdac.scanmark.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleLectureRequest {
    String facultyName ;
    String subjectName ;
    LocalDateTime lectureTime ;
    String facultyCode ;
}
