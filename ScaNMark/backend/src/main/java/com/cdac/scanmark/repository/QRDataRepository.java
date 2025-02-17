package com.cdac.scanmark.repository;

import com.cdac.scanmark.entities.Lecture;
import com.cdac.scanmark.entities.QRData;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QRDataRepository extends JpaRepository<QRData, Long> {

    // Custom method to fetch QRData by faculty email (if needed)
    List<QRData> findByFacultyEmail(String facultyEmail);

    // Custom method to find by qrContent (if needed for verification)
    Optional<QRData> findByQrContent(String qrContent);

    // Check by lecture entity
    boolean existsByLecture(Lecture lecture);

    boolean existsByLectureId(Long lectureId) ;

    // Fetch by lecture entity
    QRData findByLecture(Lecture lecture);

    QRData findTopByLectureIdOrderByCreatedAtDesc(Long lectureId) ;

    Optional<QRData> findByLectureId(Long lectureId);

}
