package com.cdac.scanmark.util;

import java.util.Random;

import org.hibernate.annotations.Comment;
import org.springframework.stereotype.Component;

@Component
public class OtpUtil {
    public static String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000)); // 6-digit OTP
    }
}

