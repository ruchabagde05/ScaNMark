package com.cdac.scanmark.dto;

import com.cdac.scanmark.entities.Faculty;
import com.cdac.scanmark.entities.Lecture;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacultyLectureHistoryResponse {
    private Faculty faculty;
    private List<Lecture> lectures;
}

