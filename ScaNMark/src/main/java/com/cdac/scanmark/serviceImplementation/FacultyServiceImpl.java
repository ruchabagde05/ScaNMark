package com.cdac.scanmark.serviceImplementation;

import com.cdac.scanmark.config.JWTProvider;
import com.cdac.scanmark.dto.AddFacultyRequest;
import com.cdac.scanmark.dto.LocationRequest;
import com.cdac.scanmark.dto.QRResponse;
import com.cdac.scanmark.dto.JwtResponse;
import com.cdac.scanmark.dto.LoginRequest;
import com.cdac.scanmark.dto.OtpVerificationRequest;
import com.cdac.scanmark.entities.Faculty;
import com.cdac.scanmark.entities.Lecture;
import com.cdac.scanmark.entities.Passwords;
import com.cdac.scanmark.entities.QRData;
import com.cdac.scanmark.repository.FacultyRepository;
import com.cdac.scanmark.repository.LectureRepository;
import com.cdac.scanmark.repository.PasswordsRepository;
import com.cdac.scanmark.repository.QRDataRepository;
import com.cdac.scanmark.service.FacultyService;
import com.cdac.scanmark.util.QRCodeGenerator;
import com.google.zxing.WriterException;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import com.cdac.scanmark.service.MailSenderService;

import jakarta.transaction.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordsRepository passwordsRepository;
    private final JWTProvider jwtProvider;
    private final QRCodeGenerator qrCodeGenerator;
    private final QRDataRepository qrDataRepository;
    private final LectureRepository lectureRepository;
    private final MailSenderService mailSenderService;

    public FacultyServiceImpl(QRDataRepository qrDataRepository, LectureRepository lectureRepository,
            QRCodeGenerator qrCodeGenerator,
            JWTProvider jwtProvider, FacultyRepository facultyRepository, PasswordEncoder passwordEncoder,
            PasswordsRepository passwordsRepository, MailSenderService mailSenderService) {

        this.qrDataRepository = qrDataRepository;
        this.lectureRepository = lectureRepository;
        this.qrCodeGenerator = qrCodeGenerator;
        this.jwtProvider = jwtProvider;
        this.facultyRepository = facultyRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordsRepository = passwordsRepository;
        this.mailSenderService = mailSenderService;

    }

    @Override
    public List<Faculty> getAllFaculties() {
        return facultyRepository.findAll(); // Fetch all faculty members
    }

    @Override
    public Faculty getFacultyByFacultyCode(String code) {
        Optional<Faculty> faculty = facultyRepository.findById(code); // Find faculty by faculty code
        return faculty.orElseThrow(() -> new RuntimeException("Faculty not found with ID: " + code));
    }

    @Override
    public Faculty createFaculty(Faculty faculty) {
        return facultyRepository.save(faculty); // Save new faculty record
    }

    @Override
    public Faculty updateFaculty(String code, Faculty faculty) {
        Faculty existingFaculty = getFacultyByFacultyCode(code); // Fetch existing faculty
        existingFaculty.setName(faculty.getName()); // Update faculty details
        return facultyRepository.save(existingFaculty); // Save updated faculty record
    }

    @Override
    public void deleteFaculty(String code) {
        Faculty faculty = getFacultyByFacultyCode(code); // Fetch faculty by ID
        facultyRepository.delete(faculty); // Delete faculty record
    }

    @Override
    public Faculty getFacultyByEmail(String email) {
        return facultyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found with email: " + email));
    }

    @Override
    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll(); // Fetch all faculties
    }

    @Override
    public Faculty addFaculty(AddFacultyRequest request) {
        if (facultyRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Faculty with email " + request.getEmail() + " already exists.");
        }

        // Save Faculty
        Faculty faculty = new Faculty();
        faculty.setFacultyCode(request.getFacultyCode());
        faculty.setDepartment(request.getDepartment());
        faculty.setEmail(request.getEmail());
        faculty.setName(request.getName());
        facultyRepository.save(faculty);

        // Generate default or custom password
        String defaultPassword = (request.getName() == null || request.getName().isBlank())
                ? "defaultPassword" // Use a default password when name is missing or blank
                : request.getName().trim().toLowerCase().substring(0,
                        request.getName().trim().indexOf(" ") == -1 ? request.getName().length()
                                : request.getName().indexOf(" "));

        String encodedPassword = passwordEncoder.encode(defaultPassword);

        // Save Password
        Passwords passwordEntry = new Passwords();
        passwordEntry.setFaculty(faculty); // Set foreign key to Student
        passwordEntry.setPassword(encodedPassword);
        passwordsRepository.save(passwordEntry);

        return faculty;
    }

    @Override
    public QRResponse generateQRForSession(LocationRequest locationRequest, String token, Long lectureId) {
        String facultyEmail = jwtProvider.getUsernameFromToken(token);

        // Fetch the lecture from DB
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        // Prevent duplication of QR Codes by checking the database
        if (qrDataRepository.existsByLectureId(lecture.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "QR Code already exists for this lecture");
        }

        // Create unique QR content
        String qrContent = lecture.getId() + "|" + LocalDateTime.now() + "|" +
                locationRequest.getLatitude() + "|" + locationRequest.getLongitude();

        // Generate QR code as Base64
        String qrBase64;
        try {
            qrBase64 = qrCodeGenerator.generateQRCode(qrContent, 300, 300);
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Error generating QR code", e);
        }

        // Save the data into database
        QRData qrData = new QRData(
                facultyEmail,
                locationRequest.getLatitude(),
                locationRequest.getLongitude(),
                qrContent,
                LocalDateTime.now(),
                lecture,
                qrBase64);
        qrDataRepository.save(qrData);

        return new QRResponse(qrBase64);
    }

    @Override
    public QRResponse getQRForLecture(Long lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        QRData qrData = qrDataRepository.findByLecture(lecture);
        if (qrData == null) {
            throw new RuntimeException("No QR Code found for the lecture");
        }

        String qrBase64;
        try {
            qrBase64 = qrCodeGenerator.generateQRCode(qrData.getQrContent(), 300, 300);
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Error regenerating QR code", e);
        }

        return new QRResponse(qrBase64);
    }

    @Override
    public void sendOtp(Faculty faculty) {
        // Generate OTP and expiration
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // 6-digit OTP
        faculty.setOtp(otp);
        faculty.setOtpExpiration(LocalDateTime.now().plusMinutes(10)); // OTP valid for 10 minutes

        facultyRepository.save(faculty);

        // Send OTP email (logic to be implemented in mail service)
        mailSenderService.sendOtp(faculty.getEmail(), otp);
    }

    @Transactional
    @Override
    public String verifyOtp(OtpVerificationRequest request) {
        // Fetch the Student by ID
        Faculty faculty = facultyRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if the OTP exists and matches
        if (faculty.getOtp() == null || !faculty.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        // Check if the OTP expiration is valid (i.e., not expired)
        if (faculty.getOtpExpiration() == null || faculty.getOtpExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Mark coordinator as verified
        faculty.setIsVerified(true);
        faculty.setOtp(null); // Clear OTP after successful verification
        faculty.setOtpExpiration(null); // Clear expiration time
        facultyRepository.save(faculty);

        return "Faculty verified successfully";
    }

    @Override
    public JwtResponse signIn(LoginRequest loginRequest) {
        loginRequest.setRole("faculty");
        String email = loginRequest.getEmail(); // Get email from login request
        // Fetch the faculty by email
        Faculty faculty = facultyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        // Check if the faculty is verified
        if (!faculty.getIsVerified()) {
            sendOtp(faculty);
            return new JwtResponse(null, "Faculty not verified yet OTP sent please verify");
        }
        // Fetch the password by faculty code
        String password = passwordsRepository.findByFacultyFacultyCode(faculty.getFacultyCode())
                .map(Passwords::getPassword)
                .orElseThrow(() -> new RuntimeException("Password not found for Faculty"));
        // Validate password
        if (!passwordEncoder.matches(loginRequest.getPassword(), password)) {
            throw new RuntimeException("Invalid credentials");
        }
        // Generate JWT token with email as the subject
        String token = jwtProvider.generateToken(email, "ROLE_FACULTY");
        // Return JwtResponse with token and a success message
        return new JwtResponse(token, "Login successful for: " + faculty.getName());
    }
}
