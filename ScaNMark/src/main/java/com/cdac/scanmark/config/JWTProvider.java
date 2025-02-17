package com.cdac.scanmark.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JWTProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    // Generate token
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email) // Set email as the subject (user identifier)
                .claim("role", role) // Add role as a claim
                .setIssuedAt(new Date()) // Set the issue date
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // Set the expiration (1 hour)
                .signWith(SignatureAlgorithm.HS512, secretKey) // Sign the token with your secret key
                .compact(); // Return the compacted JWT token
    }



    // Extract email from token
    public String getUsernameFromToken(String token) {
        return extractClaims(token).getSubject();
    }

    // Validate token
    public boolean validateToken(String token) {
        try {
            extractClaims(token); // If parsing succeeds, token is valid
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Private helper methods
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }
}
