package com.cdac.scanmark.entities;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Student {

    @Id
    private Long prn;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean isVerified;

    // for otp based authentication
    @Column(nullable = true)
    private String otp;

    @Column(nullable = true)
    private LocalDateTime otpExpiration;

    // for crypto based validation
    @Column(columnDefinition = "TEXT", nullable = true)
    private String privateKey;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String publicKey;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean isPrivateKeySent;

    public Student() {
        isVerified = false;
        isPrivateKeySent = false ;
    }

    public Student(Long prn, String name, String email) {
        this.prn = prn;
        this.name = name;
        this.email = email;
        this.isVerified = false;
        this.isPrivateKeySent = false ;
    }

    public Student(Long prn, String name, String email, String otp, LocalDateTime otpExpiration,
            String privateKey, String publicKey) {
        this.prn = prn;
        this.name = name;
        this.email = email;
        this.otp = otp;
        this.otpExpiration = otpExpiration;
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean value) {
        this.isVerified = value;
    }

    public Boolean getIsPrivateKeySent(){
        return isPrivateKeySent;
    }

    public void setIsPrivateKeySent(Boolean value){
        this.isPrivateKeySent = value;
    }

}
