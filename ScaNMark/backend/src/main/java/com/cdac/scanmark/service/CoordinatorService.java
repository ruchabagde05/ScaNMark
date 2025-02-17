package com.cdac.scanmark.service;

import com.cdac.scanmark.dto.*;
import com.cdac.scanmark.entities.Coordinator;
import com.cdac.scanmark.entities.Faculty;
import com.cdac.scanmark.entities.Lecture;
import com.cdac.scanmark.entities.Student;

import java.util.List;

public interface CoordinatorService {

    // Get all coordinators
    List<Coordinator> getAllCoordinators();
    // Get coordinator by id
    Coordinator getCoordinatorById(Long id);
    // Create a new coordinator
    Coordinator createCoordinator(Coordinator coordinator);
    // Update coordinator details
    Coordinator updateCoordinator(Long id, Coordinator coordinator);
    // Delete coordinator
    void deleteCoordinator(Long id);

    SignUpResponse signup(SignUpRequest signUpRequest) ;

    String verifyOtp(OtpVerificationRequest request) ;

    JwtResponse signIn(LoginRequest loginRequest) ;

    Coordinator getCoordinatorByEmail(String email);

    StudentHistoryResponse getStudentHistoryByPrn(Long prn) ;

    FacultyLectureHistoryResponse getFacultyHistory(String facultyCode) ;

    Student updateStudent(Long prn, UpdateStudentRequest request) ;

    void deleteStudent(Long prn) ;

    Faculty updateFaculty(String facultyCode, UpdateFacultyRequest request) ;

    void deleteFaculty(String facultyCode) ;

    Lecture scheduleLecture(ScheduleLectureRequest scheduleLectureRequest) ;
}
