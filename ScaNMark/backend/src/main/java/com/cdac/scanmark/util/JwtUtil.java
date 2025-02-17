package com.cdac.scanmark.util;

import ch.qos.logback.classic.Logger;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private final String SECRET_KEY;

    @Value("${jwt.expiration}")
    private final long EXPIRATION_TIME;

    private static final Logger logger = (Logger) LoggerFactory.getLogger(JwtUtil.class);

    public JwtUtil(@Value("${jwt.secret}") String secretKey,
                   @Value("${jwt.expiration}") long expirationTime) {
        this.SECRET_KEY = secretKey;
        this.EXPIRATION_TIME = expirationTime;
    }

    // Generate JWT Token with Role
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email) // Set email as the subject (user identifier)
                .claim("role", role) // Set the user role in the claims
                .setIssuedAt(new Date()) // Set the issue date
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // Set the expiration (1 hour in this case)
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY) // Sign the token with your secret key
                .compact(); // Create the token
    }


    // Validate Token
    public boolean validateToken(String token, String email) {
        try {
            String tokenEmail = extractUsername(token); // Extract email from token
            return tokenEmail.equals(email) && !isTokenExpired(token); // Validate email and expiration
        } catch (Exception e) {
            return false;
        }
    }

    // Extract Username from Token
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();  // Subject contains the username (email or ID)
    }

    // Extract Role from Token
    public String extractRole(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)  // Use your secret key
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Extract the role from the claims and return it, ensuring it's a String
            return claims.get("role", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            // Log the exception or handle accordingly
            logger.error("Error extracting role from token", e);
            return null;  // Return null if there's an error in parsing the token or extracting the claim
        }
    }



    // Check Token Expiration
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    // Private Helper Method: Extract Claims
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }
}
