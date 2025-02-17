package com.cdac.scanmark.controller;

import com.cdac.scanmark.dto.AttendanceRequest;
import com.cdac.scanmark.entities.Attendance;
import com.cdac.scanmark.service.AttendanceService;

import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // Update attendance
    @PutMapping("/update-attendance/{id}")
    public ResponseEntity<Attendance> updateAttendance(@RequestHeader("Authorization") String token, @PathVariable Long id, @RequestBody Attendance attendance) {
        Attendance updatedAttendance = attendanceService.updateAttendance(id, attendance);
        return ResponseEntity.ok(updatedAttendance);
    }

    // Get attendance by ID
    @GetMapping("/get-attendance-by-id/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        Attendance attendance = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(attendance);
    }

    // Get all attendance records
    @GetMapping("/get-all-attendance")
    public ResponseEntity<List<Attendance>> getAllAttendance(@RequestHeader("Authorization") String token) {
        List<Attendance> attendanceList = attendanceService.getAllAttendance();
        return ResponseEntity.ok(attendanceList);
    }

    // Delete attendance by ID
    @DeleteMapping("/delete-attendance/{id}")
    public ResponseEntity<String> deleteAttendance(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok("Attendance record deleted successfully");
    }

    // Additional endpoint: Get attendance by student
    @GetMapping("/get-attendance-by-student/{studentId}")
    public ResponseEntity<List<Attendance>> getAttendanceByStudent(@RequestHeader("Authorization") String token, @PathVariable Long studentId) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByStudent(studentId);
        return ResponseEntity.ok(attendanceList);
    }

    // Additional endpoint: Get attendance by lecture
    @GetMapping("/get-attendance-by-lecture-id/{lectureId}")
    public ResponseEntity<List<Attendance>> getAttendanceByLecture(@RequestHeader("Authorization") String token, @PathVariable Long lectureId) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByLecture(lectureId);
        return ResponseEntity.ok(attendanceList);
    }

    @PostMapping("/mark-attendance")
    public ResponseEntity<String> markAttendance(@RequestHeader("Authorization") String token,@RequestBody AttendanceRequest request) {
        try {
            attendanceService.markAttendance(request);
            return ResponseEntity.ok("Attendance marked successfully!");
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    //getting attendance records through prn
    @GetMapping("/attendance-by-prn/{prn}")
    public ResponseEntity<List<Attendance>> getAttendanceByPrn(@RequestHeader("Authorization") String token, @PathVariable Long prn) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByPrn(prn) ;
        return ResponseEntity.ok(attendanceList) ;
    }

    @GetMapping("/attendance-by-student-name/{name}")
    public ResponseEntity<List<Attendance>> getAttendanceByName(@RequestHeader("Authorization") String token, @PathVariable String name) {
        List<Attendance> attendanceList = attendanceService.getAttendanceByStudentName(name) ;
        return ResponseEntity.ok(attendanceList) ;
    }

    @GetMapping("/todays-attendance")
    public List<Attendance> getMethodName(@RequestHeader("Authorization") String token) {
        return attendanceService.getTodaysAttendance();
    }

    @GetMapping("/current-months-attendance")
    public List<Attendance> getCurrentMonthAttendance(@RequestHeader("Authorization") String token) {
        return attendanceService.getCurrentMonthAttendance();
    }
    
    
    
}
