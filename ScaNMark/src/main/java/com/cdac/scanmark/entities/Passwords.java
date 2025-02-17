package com.cdac.scanmark.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Passwords {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    @OneToOne
    @JoinColumn(name = "student_prn", nullable = true)
    private Student student ;

    @OneToOne
    @JoinColumn(name = "coordinator_id", nullable = true)
    private Coordinator coordinator ;

    @OneToOne
    @JoinColumn(name = "faculty_code", nullable = true)
    private Faculty faculty ;

    private String password ;

    public Passwords(Long id, Student student, Coordinator coordinator, Faculty faculty, String password) {
        this.id = id;
        this.student = student;
        this.coordinator = coordinator;
        this.faculty = faculty;
        this.password = password;
    }

    public Passwords(){}
}
