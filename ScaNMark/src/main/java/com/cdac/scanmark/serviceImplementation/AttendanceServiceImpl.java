package com.cdac.scanmark.serviceImplementation;

import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.security.Signature;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.cdac.scanmark.dto.AttendanceRequest;
import com.cdac.scanmark.entities.Attendance;
import com.cdac.scanmark.entities.Lecture;
import com.cdac.scanmark.entities.QRData;
import com.cdac.scanmark.entities.Student;
import com.cdac.scanmark.repository.AttendanceRepository;
import com.cdac.scanmark.repository.LectureRepository;
import com.cdac.scanmark.repository.QRDataRepository;
import com.cdac.scanmark.repository.StudentRepository;
import com.cdac.scanmark.service.AttendanceService;
import com.cdac.scanmark.util.KeyGeneratorUtil;

import jakarta.validation.ValidationException;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;

    private final QRDataRepository qrDataRepository;

    private final StudentRepository studentRepository;

    private final LectureRepository lectureRepository;

    public AttendanceServiceImpl(LectureRepository lectureRepository, AttendanceRepository attendanceRepository,
            QRDataRepository qrDataRepository,
            StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.lectureRepository = lectureRepository;
        this.studentRepository = studentRepository;
        this.qrDataRepository = qrDataRepository;
    }

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll(); // Fetch all attendance records
    }

    @Override
    public Attendance getAttendanceById(Long id) {
        Optional<Attendance> attendance = attendanceRepository.findById(id); // Find attendance by ID
        return attendance.orElseThrow(() -> new RuntimeException("Attendance not found with ID: " + id));
    }

    @Override
    public Attendance updateAttendance(Long id, Attendance attendance) {
        Attendance existingAttendance = getAttendanceById(id); // Fetch existing attendance record
        existingAttendance.setIsPresent(attendance.getIsPresent()); // Update attendance status
        return attendanceRepository.save(existingAttendance); // Save the updated record
    }

    @Override
    public void deleteAttendance(Long id) {
        Attendance attendance = getAttendanceById(id); // Fetch attendance record by ID
        attendanceRepository.delete(attendance); // Delete attendance record
    }

    @Override
    public List<Attendance> getAttendanceByStudent(Long prn) {
        return attendanceRepository.findByStudentPrn(prn); // Fetch attendance records by student ID
    }

    @Override
    public List<Attendance> getAttendanceByLecture(Long lectureId) {
        return attendanceRepository.findByLectureId(lectureId); // Fetch attendance records by lecture ID
    }

    @Override
    // Method to get attendance for a specific LocalDate
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        // Convert LocalDate to LocalDateTime (start of day and end of day)
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1); // 1 day after startOfDay

        // Fetch the attendance records for the given date range
        return attendanceRepository.findByLectureDateBetween(startOfDay, endOfDay);
    }

    @Override
    public void markAttendance(AttendanceRequest request) {
        // Extract lectureId from QR content
        Long lectureId = request.getLectureId();

        // Fetch student
        Student student = studentRepository.findByPrn(request.getStudentPrn())
                .orElseThrow(() -> new ValidationException("Student not found for prn: " + request.getStudentPrn()));

        // Fetch lecture
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new ValidationException("Student not found for prn: " + request.getStudentPrn()));

        // Fetch QR Data for the lecture
        QRData qrData = qrDataRepository.findByLectureId(lectureId)
                .orElseThrow(() -> new ValidationException("QR Data not found for lectureId: " + lectureId));

        // Step 1: Verify signature
        if (!verifySignature(request.getSignedQrContent(), request.getStudentPrn())) {
            throw new ValidationException("Signature verification failed.");
        }

        // Step 2: Check location proximity
        if (!isWithin50Meters(request.getLatitude(), request.getLongitude(), qrData.getLatitude(),
                qrData.getLongitude())) {
            throw new ValidationException("You are not within 50 meters of the classroom.");
        }

        // Step 3: Mark attendance
        Attendance attendance = new Attendance();
        attendance.setStudentPrn(request.getStudentPrn());
        attendance.setStudentName(student.getName());
        attendance.setLectureId(lectureId);
        attendance.setSubjectName(lecture.getSubjectName());
        attendance.setFacultyName(lecture.getFacultyName());
        attendance.setLectureTime(lecture.getLectureTime());
        attendance.setLectureDate(lecture.getLectureTime().toLocalDate());
        attendance.setIsPresent(true);

        attendanceRepository.save(attendance);
    }

    public boolean verifySignature(String signedQrContent, Long studentPrn) {
        // Fetch the student's public key from the database
        Student student = studentRepository.findByPrn(studentPrn)
                .orElseThrow(() -> new ValidationException("Student not found for prn: " + studentPrn));
        String publicKey = student.getPublicKey();
        PublicKey decodedPublicKey = KeyGeneratorUtil.decodePublicKey(publicKey);

        try {
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(decodedPublicKey);
            String[] parts = signedQrContent.split("\\|");
            String originalContent = String.join("|", parts[0], parts[1], parts[2], parts[3]); // Remove signature part
            signature.update(originalContent.getBytes(StandardCharsets.UTF_8));
            byte[] signedData = Base64.getDecoder().decode(parts[4]); // Decode the signature
            return signature.verify(signedData); // Validate signature
        } catch (Exception e) {
            throw new RuntimeException("Error verifying the signature", e);
        }
    }

    public boolean isWithin50Meters(Double studentLatitude, Double studentLongitude, Double qrLatitude,
            Double qrLongitude) {
        final double EARTH_RADIUS = 6371; // Earth's radius in kilometers

        double latDiff = Math.toRadians(Math.abs(studentLatitude - qrLatitude));
        double lonDiff = Math.toRadians(Math.abs(studentLongitude - qrLongitude));

        // Haversine formula
        // a = sin²(Δlat / 2) + cos(lat1) * cos(lat2) * sin²(Δlon / 2)
        // c = 2 * atan2(√a, √(1 - a))
        // distance = R * c
        // Where:
        // - R is the Earth's radius (mean radius = 6,371 km).
        // - Δlat and Δlon are the differences in latitude and longitude (in radians).
        // - lat1 and lat2 are the latitudes of the two points (in radians).

        double a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2)
                + Math.cos(Math.toRadians(qrLatitude)) * Math.cos(Math.toRadians(studentLatitude))
                        * Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS * c * 1000; // Convert to meters

        return distance <= 50; // Return true if within 50 meters
    }

    @Override
    public List<Attendance> getAttendanceByPrn(Long prn){
        List<Attendance> attendanceList = attendanceRepository.findByStudentPrn(prn) ;
        return attendanceList ;
    }

    @Override
    public List<Attendance> getAttendanceByStudentName(String name){
        List<Attendance> attendanceList = attendanceRepository.findByStudentName(name) ;
        return attendanceList ;
    }

    @Override
    public List<Attendance> getTodaysAttendance(){
        return attendanceRepository.findByLectureDate(LocalDate.now()) ;
    }

    @Override
    public List<Attendance> getCurrentMonthAttendance() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        
        return attendanceRepository.findByMonth(startOfMonth, endOfMonth);
    }

}
