package com.cdac.scanmark.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class JWTValidator {

    @Autowired
    private JWTProvider jwtProvider;

    // Validate token
    public boolean isValid(String token) {
        return jwtProvider.validateToken(token);
    }
}
