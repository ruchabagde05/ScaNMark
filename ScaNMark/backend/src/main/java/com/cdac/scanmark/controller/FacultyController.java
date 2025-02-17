package com.cdac.scanmark.controller;

import com.cdac.scanmark.config.JWTProvider;
import com.cdac.scanmark.dto.*;
import com.cdac.scanmark.entities.Faculty;
import com.cdac.scanmark.entities.QRData;
import com.cdac.scanmark.repository.QRDataRepository;
import com.cdac.scanmark.service.FacultyService;
import com.cdac.scanmark.service.ForgotPasswordService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;
    private final JWTProvider jwtProvider;
    private final ForgotPasswordService forgotPasswordService;
    private final QRDataRepository qrDataRepository;

    public FacultyController(
            FacultyService facultyService, QRDataRepository qrDataRepository,
            JWTProvider jwtProvider,
            ForgotPasswordService forgotPasswordService) {
        this.facultyService = facultyService;
        this.qrDataRepository = qrDataRepository;
        this.jwtProvider = jwtProvider;
        this.forgotPasswordService = forgotPasswordService;
    }

    @GetMapping("/get-all-faculties")
    public ResponseEntity<List<Faculty>> getAllFaculty(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(facultyService.getAllFaculty());
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody OtpVerificationRequest request) {
        String response = facultyService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest loginRequest) {
        loginRequest.setRole("faculty");
        JwtResponse jwtResponse = facultyService.signIn(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @GetMapping("/profile")
    public ResponseEntity<FacultyProfileResponse> getStudentProfile(@RequestHeader("Authorization") String token) {
        // Extract the email from the JWT token
        String emailFromToken = jwtProvider.getUsernameFromToken(token.substring(7)); // Remove "Bearer "

        // Fetch user (can be Coordinator, Faculty, or Student)
        Faculty faculty = facultyService.getFacultyByEmail(emailFromToken);

        // Map to DTO and return
        FacultyProfileResponse response = new FacultyProfileResponse();
        response.setDepartment(faculty.getDepartment());
        response.setName(faculty.getName());
        response.setEmail(faculty.getEmail());
        response.setFacultyCode(faculty.getFacultyCode());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        String email = forgotPasswordRequest.getEmail() ;
        String responseMessage = forgotPasswordService.forgotPassword(email);

        ForgotPasswordResponse response = new ForgotPasswordResponse();
        response.setMessage(responseMessage);
        response.setSuccess(!responseMessage.contains("failed"));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest resetPasswordRequest) {
        String email = resetPasswordRequest.getEmail() ;
        String otp = resetPasswordRequest.getOtp();
        String newPassword = resetPasswordRequest.getNewPassword();
        String response = forgotPasswordService.resetPassword(email, otp, newPassword, "ROLE_FACULTY");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-qr")
    public ResponseEntity<QRResponse> generateQRCode(
            @RequestBody LocationRequest locationRequest,
            @RequestParam Long lectureId,
            @RequestHeader("Authorization") String token) {
        try {
            QRResponse response = facultyService.generateQRForSession(locationRequest, token.substring(7), lectureId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new QRResponse(e.getMessage()));
        }
    }

    @GetMapping("/show-qr-again/{lectureId}")
    public ResponseEntity<?> showQRCodeAgain(@RequestHeader("Authorization") String token, @PathVariable Long lectureId) {
        QRData latestQR = qrDataRepository.findTopByLectureIdOrderByCreatedAtDesc(lectureId);
        if (latestQR != null) {
            return ResponseEntity.ok(Collections.singletonMap("qrCode", latestQR.getQrDataBase64()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "No QR Code found for this lecture"));
        }
    }

}
