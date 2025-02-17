package com.cdac.scanmark.entities;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "qr_data")
public class QRData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "faculty_email", nullable = false)
    private String facultyEmail;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "qr_content", nullable = false, unique = true)
    private String qrContent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture; // Foreign Key to Lecture entity

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String qrDataBase64 ;

    // Updated constructor for convenience
    public QRData(String facultyEmail, Double latitude, Double longitude, String qrContent, LocalDateTime createdAt, Lecture lecture, String qrData) {
        this.facultyEmail = facultyEmail;
        this.qrDataBase64 = qrData ;
        this.latitude = latitude;
        this.longitude = longitude;
        this.qrContent = qrContent;
        this.createdAt = createdAt;
        this.lecture = lecture;
    }
}
