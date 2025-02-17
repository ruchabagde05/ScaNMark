package com.cdac.scanmark.serviceImplementation;

import com.cdac.scanmark.config.JWTProvider;
import com.cdac.scanmark.dto.*;
import com.cdac.scanmark.entities.*;
import com.cdac.scanmark.exceptions.ResourceNotFoundException;
import com.cdac.scanmark.repository.*;
import com.cdac.scanmark.service.CoordinatorService;
import com.cdac.scanmark.service.MailSenderService;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CoordinatorServiceImpl implements CoordinatorService {

    private final CoordinatorRepository coordinatorRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordsRepository passwordsRepository;
    private final MailSenderService mailSenderService;
    private final JWTProvider jwtProvider;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final FacultyRepository facultyRepository;
    private final LectureRepository lectureRepository;
    private final EntityManager entityManager;

    public CoordinatorServiceImpl(CoordinatorRepository coordinatorRepository, PasswordEncoder passwordEncoder,
            PasswordsRepository passwordsRepository, MailSenderService mailSenderService, JWTProvider jwtProvider,
            StudentRepository studentRepository, AttendanceRepository attendanceRepository,
            FacultyRepository facultyRepository, LectureRepository lectureRepository, EntityManager entityManager) {
        this.coordinatorRepository = coordinatorRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordsRepository = passwordsRepository;
        this.mailSenderService = mailSenderService;
        this.jwtProvider = jwtProvider;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.facultyRepository = facultyRepository;
        this.lectureRepository = lectureRepository;
        this.entityManager = entityManager;
    }

    @Override
    public List<Coordinator> getAllCoordinators() {
        return coordinatorRepository.findAll();
    }

    @Override
    public Coordinator getCoordinatorById(Long id) {
        return coordinatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with id " + id));
    }

    @Override
    public Coordinator createCoordinator(Coordinator coordinator) {
        return coordinatorRepository.save(coordinator);
    }

    @Override
    public Coordinator updateCoordinator(Long id, Coordinator coordinator) {
        Coordinator existingCoordinator = coordinatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with id " + id));
        existingCoordinator.setName(coordinator.getName());
        // Update other fields as necessary
        return coordinatorRepository.save(existingCoordinator);
    }

    @Override
    public void deleteCoordinator(Long id) {
        coordinatorRepository.deleteById(id);
    }

    @Transactional
    @Override
    public SignUpResponse signup(SignUpRequest signUpRequest) {
        if (coordinatorRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        String encodePassword = passwordEncoder.encode(signUpRequest.getPassword());

        // Create and save Coordinator entity
        Coordinator coordinator = new Coordinator();
        coordinator.setEmail(signUpRequest.getEmail());
        coordinator.setName(signUpRequest.getName());

        // Generate OTP and expiration
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // 6-digit OTP
        coordinator.setOtp(otp);
        coordinator.setOtpExpiration(LocalDateTime.now().plusMinutes(10)); // OTP valid for 10 minutes

        Coordinator savedCoordinator = coordinatorRepository.save(coordinator);

        // Save password in Passwords entity
        Passwords passwords = new Passwords();
        passwords.setCoordinator(savedCoordinator);
        passwords.setPassword(encodePassword);
        passwordsRepository.save(passwords);

        // Send OTP email (logic to be implemented in mail service)
        mailSenderService.sendOtp(signUpRequest.getEmail(), otp);

        return new SignUpResponse("Coordinator registered successfully. Please verify OTP to activate your account.",
                coordinator.getId());
    }

    @Override
    public JwtResponse signIn(LoginRequest loginRequest) {
        loginRequest.setRole("coordinator");
        String email = loginRequest.getEmail(); // Get email from login request
        // Fetch the coordinator by email
        Coordinator coordinator = coordinatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));
        // Check if the coordinator is verified
        if (!coordinator.getIsVerified()) {
            throw new RuntimeException("Coordinator is not verified. Please complete OTP verification.");
        }
        // Fetch the password by coordinator ID
        String password = passwordsRepository.findByCoordinatorId(coordinator.getId())
                .map(Passwords::getPassword)
                .orElseThrow(() -> new RuntimeException("Password not found for coordinator"));
        // Validate password
        if (!passwordEncoder.matches(loginRequest.getPassword(), password)) {
            throw new RuntimeException("Invalid credentials");
        }
        // Generate JWT token with email as the subject
        String token = jwtProvider.generateToken(email, "ROLE_COORDINATOR");
        // Return JwtResponse with token and a success message
        return new JwtResponse(token, "Login successful");
    }

    @Transactional
    @Override
    public String verifyOtp(OtpVerificationRequest request) {
        // Fetch the coordinator by ID
        Coordinator coordinator = coordinatorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));

        // Check if the OTP exists and matches
        if (coordinator.getOtp() == null || !coordinator.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        // Check if the OTP expiration is valid (i.e., not expired)
        if (coordinator.getOtpExpiration() == null || coordinator.getOtpExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Mark coordinator as verified
        coordinator.setIsVerified(true);
        coordinator.setOtp(null); // Clear OTP after successful verification
        coordinator.setOtpExpiration(null); // Clear expiration time
        coordinatorRepository.save(coordinator);

        return "Coordinator verified successfully";
    }

    @Override
    public Coordinator getCoordinatorByEmail(String email) {
        return coordinatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with email: " + email));
    }

    @Override
    public StudentHistoryResponse getStudentHistoryByPrn(Long prn) {
        Student student = studentRepository.findByPrn(prn)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with prn : " + prn));

        List<Attendance> attendanceList = attendanceRepository.findByStudentPrn(prn);

        return new StudentHistoryResponse(student, attendanceList);
    }

    @Transactional
    public FacultyLectureHistoryResponse getFacultyHistory(String facultyCode) {
        Faculty faculty = facultyRepository.findByFacultyCode(facultyCode)
                .orElseThrow(() -> new RuntimeException("Faculty not found with code: " + facultyCode));

        List<Lecture> lectures = lectureRepository.findByFacultyCode(faculty.getFacultyCode());

        return new FacultyLectureHistoryResponse(faculty, lectures);
    }

    @Transactional
    public Student updateStudent(Long prn, UpdateStudentRequest request) {
        Student student = studentRepository.findByPrn(prn)
                .orElseThrow(() -> new RuntimeException("Student not found with PRN: " + prn));

        if (request.getName() != null && !request.getName().isBlank()) {
            student.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            student.setEmail(request.getEmail());
            studentRepository.setIsVerifiedFalse(prn);
            // Refresh student entity to ensure latest data is loaded
            // student = studentRepository.findByPrn(prn)
            // .orElseThrow(() -> new RuntimeException("Student not found after update!"));
            entityManager.refresh(student);
        }
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long prn) {
        if (!studentRepository.existsByPrn(prn)) {
            throw new RuntimeException("Student not found with PRN: " + prn);
        }
        passwordsRepository.deleteByStudentPrn(prn);
        studentRepository.deleteByPrn(prn);
    }

    @Transactional
    public Faculty updateFaculty(String facultyCode, UpdateFacultyRequest request) {
        Faculty faculty = facultyRepository.findByFacultyCode(facultyCode)
                .orElseThrow(() -> new RuntimeException("Faculty not found with code: " + facultyCode));

        if (request.getName() != null && !request.getName().isBlank()) {
            faculty.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            faculty.setEmail(request.getEmail());
            facultyRepository.setIsVerifiedFalse(facultyCode);
            entityManager.refresh(faculty);
        }
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            faculty.setDepartment(request.getDepartment());
        }
        return facultyRepository.save(faculty);
    }

    @Transactional
    public void deleteFaculty(String facultyCode) {
        if (!facultyRepository.existsByFacultyCode(facultyCode)) {
            throw new RuntimeException("Faculty not found with code: " + facultyCode);
        }
        passwordsRepository.deleteByFacultyFacultyCode(facultyCode);
        facultyRepository.deleteByFacultyCode(facultyCode);
    }

    @Override
    public Lecture scheduleLecture(ScheduleLectureRequest scheduleLectureRequest) {
        // Validate Request
        if (scheduleLectureRequest.getFacultyName() == null ||
                scheduleLectureRequest.getSubjectName() == null ||
                scheduleLectureRequest.getLectureTime() == null ||
                scheduleLectureRequest.getFacultyCode() == null) {
            throw new IllegalArgumentException(
                    "Faculty name, subject name, lecture time, and faculty code must not be null.");
        }

        // Validate if the faculty exists using the faculty code
        Optional<Faculty> facultyOptional = facultyRepository
                .findByFacultyCode(scheduleLectureRequest.getFacultyCode());
        if (facultyOptional.isEmpty()) {
            throw new RuntimeException(
                    "No faculty found with the provided code: " + scheduleLectureRequest.getFacultyCode());
        }
        Faculty faculty = facultyOptional.get();

        // Check if the faculty is available at the requested time
        boolean isFacultyAvailable = lectureRepository.existsByFacultyAndLectureTime(
                faculty, scheduleLectureRequest.getLectureTime());

        if (isFacultyAvailable) {
            throw new RuntimeException("The faculty is already scheduled for a lecture at the given time.");
        }

        // Create a new Lecture object
        Lecture lecture = new Lecture();
        lecture.setFacultyName(scheduleLectureRequest.getFacultyName());
        lecture.setSubjectName(scheduleLectureRequest.getSubjectName());
        lecture.setLectureTime(scheduleLectureRequest.getLectureTime());
        lecture.setFaculty(faculty); // Set the faculty entity

        // Save the lecture to the database
        lecture = lectureRepository.save(lecture);

        return lecture;
    }

}
