package com.cdac.scanmark.repository;

import com.cdac.scanmark.entities.Passwords;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface PasswordsRepository extends JpaRepository<Passwords, Long> {

    Optional<Passwords> findByStudentPrn(Long prn);

    Optional<Passwords> findByFacultyFacultyCode(String facultyCode);

    Optional<Passwords> findByCoordinatorId(Long coordinatorId);

    void deleteByStudentPrn(Long prn) ;
    
    void deleteByFacultyFacultyCode(String facultyCode) ;

}