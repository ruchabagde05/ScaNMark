package com.cdac.scanmark.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "attendance", indexes = {
        @Index(name = "idx_student_prn", columnList = "student_prn"),
        @Index(name = "idx_lecture_id", columnList = "lecture_id"),
        @Index(name = "idx_lecture_date", columnList = "lecture_date")
})
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_prn", nullable = false)
    private Long studentPrn;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "lecture_id", nullable = false)
    private Long lectureId;

    @Column(name = "subject_name", nullable = false)
    private String subjectName;

    @Column(name = "faculty_name", nullable = false)
    private String facultyName;

    @Column(name = "lecture_time", nullable = false)
    private LocalDateTime lectureTime;

    @Column(name = "lecture_date", nullable = false)
    private LocalDate lectureDate;

    @Column(name = "is_present", nullable = false)
    private Boolean isPresent;
}
