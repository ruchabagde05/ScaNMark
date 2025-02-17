package com.cdac.scanmark.serviceImplementation;

import com.cdac.scanmark.config.JWTProvider;
import com.cdac.scanmark.dto.*;
import com.cdac.scanmark.entities.Student;
import com.cdac.scanmark.entities.Passwords;
import com.cdac.scanmark.repository.AttendanceRepository;
import com.cdac.scanmark.repository.LectureRepository;
import com.cdac.scanmark.repository.PasswordsRepository;
import com.cdac.scanmark.repository.StudentRepository;
import com.cdac.scanmark.service.MailSenderService;
import com.cdac.scanmark.service.StudentService;
import com.cdac.scanmark.util.JwtUtil;
import com.cdac.scanmark.util.KeyGeneratorUtil;

import java.time.LocalDate;
import java.util.*;

import jakarta.transaction.Transactional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.KeyPair;
import java.time.LocalDateTime;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final LectureRepository lectureRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordsRepository passwordsRepository;
    private final JWTProvider jwtProvider;
    private final MailSenderService mailSenderService;
    private final JwtUtil jwtUtil;
    private final AttendanceRepository attendanceRepository;

    public StudentServiceImpl(StudentRepository studentRepository, PasswordEncoder passwordEncoder,
            PasswordsRepository passwordsRepository, JWTProvider jwtProvider, MailSenderService mailSenderService,
            JwtUtil jwtUtil, LectureRepository lectureRepository, AttendanceRepository attendanceRepository) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordsRepository = passwordsRepository;
        this.jwtProvider = jwtProvider;
        this.mailSenderService = mailSenderService;
        this.jwtUtil = jwtUtil;
        this.lectureRepository = lectureRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student getStudentByPrn(Long prn) {
        return studentRepository.findByPrn(prn)
                .orElseThrow(() -> new RuntimeException("Student not found with PRN: " + prn));
    }

    @Override
    public Student getStudentByEmail(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found with email: " + email));
    }

    @Override
    public Student createStudent(Student student) {
        if (studentRepository.findByPrn(student.getPrn()).isPresent()) {
            throw new RuntimeException("Student with PRN already exists: " + student.getPrn());
        }
        return studentRepository.save(student);
    }

    @Override
    public Student updateStudent(Long prn, Student updatedStudent) {
        Student existingStudent = getStudentByPrn(prn);
        existingStudent.setName(updatedStudent.getName());
        existingStudent.setEmail(updatedStudent.getEmail());
        return studentRepository.save(existingStudent);
    }

    @Override
    public void deleteStudent(Long prn) {
        Student student = getStudentByPrn(prn);
        studentRepository.delete(student);
    }

    @Override
    public Student addStudent(AddStudentRequest request) {
        if (studentRepository.existsById(request.getPrn())) {
            throw new RuntimeException("Student with PRN " + request.getPrn() + " already exists.");
        }

        // Save Student
        Student student = new Student();
        student.setPrn(request.getPrn());
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        studentRepository.save(student);

        // Generate default or custom password
        String defaultPassword = String
                .valueOf(request.getPrn())
                .substring(String.valueOf(request.getPrn())
                        .length() - 4); // Last 4 digits of PRN

        String encodedPassword = passwordEncoder.encode(defaultPassword);

        // Save Password
        Passwords passwordEntry = new Passwords();
        passwordEntry.setStudent(student); // Set foreign key to Student
        passwordEntry.setPassword(encodedPassword);
        passwordsRepository.save(passwordEntry);

        return student;
    }

    @Override
    public void sendOtp(Student student) {
        // Generate OTP and expiration
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000); // 6-digit OTP
        student.setOtp(otp);
        student.setOtpExpiration(LocalDateTime.now().plusMinutes(10)); // OTP valid for 10 minutes

        studentRepository.save(student);

        // Send OTP email (logic to be implemented in mail service)
        mailSenderService.sendOtp(student.getEmail(), otp);
    }

    @Override
    public Long getPrnThroughToken(String token) {
        String email = jwtUtil.extractUsername(token);
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return student.getPrn();
    }

    @Transactional
    @Override
    public String verifyOtp(OtpVerificationRequest request) {
        // Fetch the Student by ID
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if the OTP exists and matches
        if (student.getOtp() == null || !student.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        // Check if the OTP expiration is valid (i.e., not expired)
        if (student.getOtpExpiration() == null || student.getOtpExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Mark coordinator as verified
        student.setIsVerified(true);
        student.setOtp(null); // Clear OTP after successful verification
        student.setOtpExpiration(null); // Clear expiration time
        studentRepository.save(student);

        return "Student verified successfully";
    }

    @Override
    public Object signIn(LoginRequest loginRequest) {
        loginRequest.setRole("student");
        String email = loginRequest.getEmail(); // Get email from login request

        // Fetch the Student by email
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        // Check if the Student is verified
        if (!student.getIsVerified()) {
            sendOtp(student);
            return new JwtResponse(null, "Student not verified yet OTP sent please verify");
        }
        // Fetch the password by Student prn
        String password = passwordsRepository.findByStudentPrn(student.getPrn())
                .map(Passwords::getPassword)
                .orElseThrow(() -> new RuntimeException("Password not found for Student"));
        // Validate password
        if (!passwordEncoder.matches(loginRequest.getPassword(), password)) {
            throw new RuntimeException("Invalid credentials");
        }

        try {
            // Check if the student already has keys
            if (student.getPrivateKey() == null) {
                generateKeysForStudent(student);
            }

        } catch (Exception e) {
            throw new RuntimeException("Error generating cryptographic keys for student", e);
        }
        // Generate JWT token with email as the subject
        String token = jwtProvider.generateToken(email, "ROLE_STUDENT");
        // Return JwtResponse with token and a success message

        // Check and send public key if not already sent
        if (student.getIsVerified() && !student.getIsPrivateKeySent()) {
            student.setIsPrivateKeySent(true);
            studentRepository.save(student); // Persist the flag update
            return new JwtResponseWithKey(token, "Login successful for: " + student.getName(), student.getPrivateKey());
        }
        return new JwtResponse(token, "Login successful for: " + student.getName());
    }

    public void generateKeysForStudent(Student student) throws Exception {

        // Generate Key Pair
        KeyPair keyPair = KeyGeneratorUtil.generateKeyPair();
        String publicKey = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
        String privateKey = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());

        // Save keys
        student.setPublicKey(publicKey);
        student.setPrivateKey(privateKey);

        studentRepository.save(student);
    }

    @Override
    public Map<String, Object> getAttendancePercentage(Long prn) {
        int totalLecturesConducted = lectureRepository.countTotalLectures();

        int totalLecturesAttended = attendanceRepository.countByStudentPrn(prn);

        double attendancePercentage = (totalLecturesConducted == 0) ? 0.0
                : ((double) totalLecturesAttended / totalLecturesConducted) * 100;

        // Step 4: Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("studentPrn", prn);
        response.put("totalLectures", totalLecturesConducted);
        response.put("attendedLectures", totalLecturesAttended);
        response.put("attendancePercentage", attendancePercentage);

        return response;
    }

    @Override
    public Map<String, Double> getSubjectWiseAttendance(Long studentPrn) {
        Map<String, Double> subjectWiseAttendance = new HashMap<>();

        // Step 1: Get all subjects from the lectures table
        List<String> subjects = lectureRepository.findAllSubjects();

        for (String subject : subjects) {
            // Step 2: Count total scheduled lectures for the subject
            int totalLectures = lectureRepository.countScheduledLecturesBySubject(subject);

            // Step 3: Count total attended lectures by student for the subject
            int attendedLectures = attendanceRepository.countAttendedLecturesByStudentAndSubject(studentPrn, subject);

            // Step 4: Calculate attendance percentage
            double attendancePercentage = (totalLectures == 0) ? 0
                    : ((double) attendedLectures / totalLectures) * 100;

            // Step 5: Store in response map
            subjectWiseAttendance.put(subject, attendancePercentage);
        }

        return subjectWiseAttendance;
    }



    @Override
    public List<StudentAttendanceDTO> getAllStudentsAttendance() {
        List<Student> students = studentRepository.findAll();
        List<StudentAttendanceDTO> attendanceList = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (Student student : students) {
            Long prn = student.getPrn();
            String name = student.getName();

            // Check today's attendance
            Boolean isPresentToday = attendanceRepository.isStudentPresentToday(prn, today);
            String todayAttendance = (isPresentToday != null && isPresentToday) ? "present" : "absent";

            // Calculate overall attendance percentage
            int totalLectures = attendanceRepository.countTotalLectures(prn);
            int attendedLectures = attendanceRepository.countAttendedLectures(prn);

            double overallAttendance = (totalLectures == 0) ? 0
                    : ((double) attendedLectures / totalLectures) * 100;

            attendanceList.add(new StudentAttendanceDTO(prn, name, todayAttendance, overallAttendance));
        }

        return attendanceList;
    }

}
