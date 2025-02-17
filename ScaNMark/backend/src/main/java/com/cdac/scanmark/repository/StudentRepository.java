package com.cdac.scanmark.repository;

import com.cdac.scanmark.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.util.Optional ;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByPrn(Long prn);

    Optional<Student> findByEmail(String email) ;

    boolean existsByEmail(String email) ;

    void deleteByPrn(Long prn) ;

    boolean existsByPrn(Long prn) ;

    @Transactional
    @Modifying
    @Query("UPDATE Student s SET s.isVerified = false WHERE s.prn = :prn")
    void setIsVerifiedFalse(@Param("prn") Long prn);
}
