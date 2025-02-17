package com.cdac.scanmark.controller;

import com.cdac.scanmark.config.JWTProvider;
import com.cdac.scanmark.dto.*;
import com.cdac.scanmark.entities.Attendance;
import com.cdac.scanmark.entities.Faculty;
import com.cdac.scanmark.entities.Lecture;
import com.cdac.scanmark.entities.Student;
import com.cdac.scanmark.exceptions.ResourceNotFoundException;
import com.cdac.scanmark.service.*;
import com.cdac.scanmark.entities.Coordinator;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/coordinators")
public class CoordinatorController {

    private final CoordinatorService coordinatorService;
    private final JWTProvider jwtProvider;
    private final ForgotPasswordService forgotPasswordService;
    private final AttendanceService attendanceService;
    private final StudentService studentService;
    private final FacultyService facultyService;

    public CoordinatorController(CoordinatorService coordinatorService, JWTProvider jwtProvider,
            ForgotPasswordService forgotPasswordService, AttendanceService attendanceService,
            StudentService studentService, FacultyService facultyService) {
        this.coordinatorService = coordinatorService;
        this.jwtProvider = jwtProvider;
        this.forgotPasswordService = forgotPasswordService;
        this.attendanceService = attendanceService;
        this.studentService = studentService;
        this.facultyService = facultyService;
    }

    @PostMapping("/signin")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        loginRequest.setRole("coordinator");
        // Call signIn method in CoordinatorService
        JwtResponse jwtResponse = coordinatorService.signIn(loginRequest);

        // Map JwtResponse to LoginResponse
        LoginResponse loginResponse = new LoginResponse(jwtResponse.getToken(), jwtResponse.getMessage()); 
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signup(@RequestBody SignUpRequest signUpRequest) {
        SignUpResponse response = coordinatorService.signup(signUpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody OtpVerificationRequest request) {
        String response = coordinatorService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    // Forgot Password - Request OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
            @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        String email = forgotPasswordRequest.getEmail();
        String responseMessage = forgotPasswordService.forgotPassword(email);

        ForgotPasswordResponse response = new ForgotPasswordResponse();
        response.setMessage(responseMessage);
        response.setSuccess(!responseMessage.contains("failed"));

        return ResponseEntity.ok(response);
    }

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest resetPasswordRequest) {
        String email = resetPasswordRequest.getEmail() ;
        String otp = resetPasswordRequest.getOtp();
        String newPassword = resetPasswordRequest.getNewPassword();
        String response = forgotPasswordService.resetPassword(email, otp, newPassword, "ROLE_COORDINATOR");
        return ResponseEntity.ok(response);
    }

    // Get Profile (Only authorized users can access their profile)
    @GetMapping("/profile")
    public ResponseEntity<CoordinatorProfileResponse> getUserProfile(@RequestHeader("Authorization") String token) {
        // Extract the email from the JWT token
        String emailFromToken = jwtProvider.getUsernameFromToken(token.substring(7)); // Remove "Bearer "

        // Fetch user (can be Coordinator, Faculty, or Student)
        Coordinator coordinator = coordinatorService.getCoordinatorByEmail(emailFromToken);

        // Map to DTO and return
        CoordinatorProfileResponse response = new CoordinatorProfileResponse();
        response.setName(coordinator.getName());
        response.setEmail(coordinator.getEmail());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search-student/{prn}")
    public ResponseEntity<StudentHistoryResponse> searchStudent(@RequestHeader("Authorization") String token,@PathVariable Long prn) {
        StudentHistoryResponse response = coordinatorService.getStudentHistoryByPrn(prn);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search-attendance-by-date/{date}")
    public ResponseEntity<List<Attendance>> getAttendanceByDate(@RequestHeader("Authorization") String token,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByDate(date);
        if (attendanceList.isEmpty()) {
            throw new ResourceNotFoundException("No attendance records found for the given date: " + date);
        }
        return ResponseEntity.ok(attendanceList);
    }

    @GetMapping("/faculty-history/{facultyCode}")
    public ResponseEntity<FacultyLectureHistoryResponse> getFacultyHistory(@RequestHeader("Authorization") String token, @PathVariable String facultyCode) {
        FacultyLectureHistoryResponse response = coordinatorService.getFacultyHistory(facultyCode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-student")
    public ResponseEntity<Student> addStudent(@RequestHeader("Authorization") String token, @RequestBody AddStudentRequest addStudentRequest) {
        Student response = studentService.addStudent(addStudentRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-faculty")
    public ResponseEntity<Faculty> addFaculty(@RequestHeader("Authorization") String token, @RequestBody AddFacultyRequest addFacultyRequest) {
        Faculty response = facultyService.addFaculty(addFacultyRequest);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-student/{prn}")
    public ResponseEntity<Student> updateStudent(@RequestHeader("Authorization") String token, 
            @PathVariable Long prn,
            @RequestBody UpdateStudentRequest request) {
        Student updatedStudent = coordinatorService.updateStudent(prn, request);
        return ResponseEntity.ok(updatedStudent);
    }

    @DeleteMapping("/delete-student/{prn}")
    public ResponseEntity<Map<String, String>> deleteStudent(@RequestHeader("Authorization") String token, @PathVariable Long prn) {
        coordinatorService.deleteStudent(prn);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Student deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-faculty/{facultyCode}")
    public ResponseEntity<Faculty> updateFaculty(@RequestHeader("Authorization") String token, 
            @PathVariable String facultyCode,
            @RequestBody UpdateFacultyRequest request) {
        Faculty updatedFaculty = coordinatorService.updateFaculty(facultyCode, request);
        return ResponseEntity.ok(updatedFaculty);
    }

    @DeleteMapping("/delete-faculty/{facultyCode}")
    public ResponseEntity<Map<String, String>> deleteFaculty(@RequestHeader("Authorization") String token, @PathVariable String facultyCode) {
        coordinatorService.deleteFaculty(facultyCode);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Faculty deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/schedule-lecture")
    public ResponseEntity<Lecture> postMethodName(@RequestHeader("Authorization") String token, @RequestBody ScheduleLectureRequest scheduleLectureRequest) {
        Lecture response = coordinatorService.scheduleLecture(scheduleLectureRequest);
        return ResponseEntity.ok(response);
    }
}
