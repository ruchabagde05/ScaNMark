package com.cdac.scanmark.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Coordinator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    @Column(nullable = false)
    private String name ;

    @Column(nullable = false, unique = true)
    private String email ;

    //for otp based authentication
    @Column(nullable = true)
    private String otp ;

    @Column(nullable = true)
    private LocalDateTime otpExpiration ;

    @Column(nullable = false)
    private Boolean isVerified = false;

    public Coordinator() { isVerified = false ;
    }

    public Coordinator(Long id, String name, String email, String otp, LocalDateTime otpExpiration, Boolean isVerified) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.otp = otp;
        this.otpExpiration = otpExpiration;
        this.isVerified = isVerified;
    }
}
