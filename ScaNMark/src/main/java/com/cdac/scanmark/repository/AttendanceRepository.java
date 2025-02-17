package com.cdac.scanmark.repository;

import com.cdac.scanmark.entities.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    @NonNull
    // Find attendance by studentId
    List<Attendance> findByStudentPrn(Long prn);

    List<Attendance> findByStudentName(String name);

    // Find attendance by lectureId
    List<Attendance> findByLectureId(Long lectureId);

    @Query("SELECT a FROM Attendance a WHERE a.lectureDate >= :startOfDay AND a.lectureDate < :endOfDay")
    List<Attendance> findByLectureDateBetween(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentPrn = :studentPrn")
    int countByStudentPrn(@Param("studentPrn") Long studentPrn);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentPrn = :studentPrn AND a.subjectName = :subjectName AND a.isPresent = true")
    int countAttendedLecturesByStudentAndSubject(@Param("studentPrn") Long studentPrn,
            @Param("subjectName") String subjectName);

    List<Attendance> findByLectureDate(LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.lectureDate BETWEEN :startOfMonth AND :endOfMonth")
    List<Attendance> findByMonth(@Param("startOfMonth") LocalDate startOfMonth,
            @Param("endOfMonth") LocalDate endOfMonth);

}
