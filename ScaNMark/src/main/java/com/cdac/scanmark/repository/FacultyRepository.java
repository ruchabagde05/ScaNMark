package com.cdac.scanmark.repository;

import com.cdac.scanmark.entities.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, String> {

    @NonNull
    Optional<Faculty> findById(@NonNull String id) ;

    Optional<Faculty> findByName(String facultyName) ;

    Optional<Faculty> findByEmail(String email) ;

    boolean existsByEmail(String email) ;

    Optional<Faculty> findByFacultyCode(String facultyCode) ;

    boolean existsByFacultyCode(String facultyCode) ;

    void deleteByFacultyCode(String facultyCode) ;

    @Transactional
    @Modifying
    @Query("UPDATE Faculty f SET f.isVerified = false WHERE f.facultyCode = :facultyCode")
    void setIsVerifiedFalse(@Param("facultyCode") String facultyCode);

}
