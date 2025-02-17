package com.cdac.scanmark.serviceImplementation;

import com.cdac.scanmark.dto.LoginRequest;
import com.cdac.scanmark.dto.LoginResponse;
import com.cdac.scanmark.entities.Coordinator;
import com.cdac.scanmark.entities.Faculty;
import com.cdac.scanmark.entities.Student;
import com.cdac.scanmark.repository.CoordinatorRepository;
import com.cdac.scanmark.repository.FacultyRepository;
import com.cdac.scanmark.repository.StudentRepository;
import com.cdac.scanmark.repository.PasswordsRepository;
import com.cdac.scanmark.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.cdac.scanmark.entities.Passwords;

@Service
public class AuthService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private CoordinatorRepository coordinatorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordsRepository passwordsRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthService(StudentRepository studentRepository, FacultyRepository facultyRepository,
            CoordinatorRepository coordinatorRepository, PasswordEncoder passwordEncoder,
            PasswordsRepository passwordsRepository, JwtUtil jwtUtil) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.coordinatorRepository = coordinatorRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordsRepository = passwordsRepository;
        this.jwtUtil = jwtUtil;
    }

    private String findPassword(String role, String email) {
        // Find student by email
        // Find password by student PRN
        // Find faculty by email
        // Find password by faculty code
        // Find coordinator by email
        // Find password by coordinator ID
        return switch (role.toLowerCase()) {
            case "student" -> {
                Student student = studentRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Invalid Student email"));
                yield passwordsRepository.findByStudentPrn(student.getPrn())
                        .map(Passwords::getPassword)
                        .orElseThrow(
                                () -> new RuntimeException("Password not found for Student PRN: " + student.getPrn()));
            }
            case "faculty" -> {
                Faculty faculty = facultyRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Invalid Faculty email"));
                yield passwordsRepository.findByFacultyFacultyCode(faculty.getFacultyCode())
                        .map(Passwords::getPassword)
                        .orElseThrow(() -> new RuntimeException(
                                "Password not found for Faculty code: " + faculty.getFacultyCode()));
            }
            case "coordinator" -> {
                Coordinator coordinator = coordinatorRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Invalid Coordinator email"));
                yield passwordsRepository.findByCoordinatorId(coordinator.getId())
                        .map(Passwords::getPassword)
                        .orElseThrow(() -> new RuntimeException(
                                "Password not found for Coordinator ID: " + coordinator.getId()));
            }
            default -> throw new RuntimeException("Invalid role for password lookup");
        };
    }

    public LoginResponse login(LoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();
        String role = loginRequest.getRole();
        String token;
        String message;

        // Fetch the hashed password based on the role and email
        String hashedPassword = findPassword(role, email);

        switch (role.toLowerCase()) {
            case "student" -> {
                Student student = studentRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Invalid Student email"));
                if (!passwordEncoder.matches(password, hashedPassword)) {
                    throw new RuntimeException("Invalid Password");
                }
                token = jwtUtil.generateToken(email, "ROLE_STUDENT"); // Pass email as subject in token generation
                message = "Login successful for Student: " + student.getName();
                return new LoginResponse(token, message);
            }
            case "faculty" -> {
                Faculty faculty = facultyRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Invalid Faculty email"));
                if (!passwordEncoder.matches(password, hashedPassword)) {
                    throw new RuntimeException("Invalid Password");
                }
                token = jwtUtil.generateToken(email, "ROLE_FACULTY"); // Pass email as subject in token generation
                message = "Login successful for Faculty: " + faculty.getName();
                return new LoginResponse(token, message);
            }
            case "coordinator" -> {
                Coordinator coordinator = coordinatorRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Invalid Coordinator email"));
                if (!passwordEncoder.matches(password, hashedPassword)) {
                    throw new RuntimeException("Invalid Password");
                }
                token = jwtUtil.generateToken(email, "ROLE_COORDINATOR"); // Pass email as subject in token generation
                message = "Login successful for Coordinator: " + coordinator.getName();
                return new LoginResponse(token, message);
            }
            default -> throw new RuntimeException("Invalid Role");
        }
    }
}
