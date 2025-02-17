package com.cdac.scanmark.controller;

import com.cdac.scanmark.config.JWTProvider;
import com.cdac.scanmark.dto.*;
import com.cdac.scanmark.entities.Student;
import com.cdac.scanmark.service.ForgotPasswordService;
import com.cdac.scanmark.service.StudentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final JWTProvider jwtProvider;
    private final ForgotPasswordService forgotPasswordService;

    public StudentController(StudentService studentService, JWTProvider jwtProvider,
            ForgotPasswordService forgotPasswordService) {
        this.studentService = studentService;
        this.jwtProvider = jwtProvider;
        this.forgotPasswordService = forgotPasswordService;
    }

    @GetMapping("/get-all-students")
    public ResponseEntity<List<Student>> getAllStudents(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/get-prn-through-token")
    public Long getMethodName(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            return studentService.getPrnThroughToken(token);
        }
        throw new RuntimeException("Invalid Authorization header");
    }

    @GetMapping("/{prn}")
    public ResponseEntity<Student> getStudentByPrn(@PathVariable Long prn) {
        return ResponseEntity.ok(studentService.getStudentByPrn(prn));
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        return ResponseEntity.ok(studentService.createStudent(student));
    }

    @PutMapping("/{prn}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long prn, @RequestBody Student updatedStudent) {
        return ResponseEntity.ok(studentService.updateStudent(prn, updatedStudent));
    }

    @DeleteMapping("/{prn}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long prn) {
        studentService.deleteStudent(prn);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody LoginRequest loginRequest) {
        loginRequest.setRole("student");
        Object response = studentService.signIn(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody OtpVerificationRequest request) {
        String response = studentService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    // Get Profile (Only authorized users can access their profile)
    @GetMapping("/profile")
    public ResponseEntity<StudentProfileResponse> getStudentProfile(@RequestHeader("Authorization") String token) {
        // Extract the email from the JWT token
        String emailFromToken = jwtProvider.getUsernameFromToken(token.substring(7)); // Remove "Bearer "

        // Fetch user (can be Coordinator, Faculty, or Student)
        Student student = studentService.getStudentByEmail(emailFromToken);

        // Map to DTO and return
        StudentProfileResponse response = new StudentProfileResponse();
        response.setPrn(student.getPrn());
        response.setName(student.getName());
        response.setEmail(student.getEmail());
        return ResponseEntity.ok(response);
    }

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
        String email = resetPasswordRequest.getEmail();
        String otp = resetPasswordRequest.getOtp();
        String newPassword = resetPasswordRequest.getNewPassword();
        String response = forgotPasswordService.resetPassword(email, otp, newPassword, "ROLE_STUDENT");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{prn}/attendance-percentage")
    public ResponseEntity<?> getAttendancePercentage(@PathVariable Long prn) {
        Map<String, Object> response = studentService.getAttendancePercentage(prn);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{prn}/attendance-percentage/subject-wise")
    public ResponseEntity<Map<String, Double>> getSubjectWiseAttendance(@PathVariable Long prn) {
        Map<String, Double> attendance = studentService.getSubjectWiseAttendance(prn);
        return ResponseEntity.ok(attendance);
    }
}