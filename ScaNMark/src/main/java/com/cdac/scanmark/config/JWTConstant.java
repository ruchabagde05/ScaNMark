package com.cdac.scanmark.config;

public class JWTConstant {

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final String INVALID_TOKEN = "Invalid JWT Token";
    public static final String EXPIRED_TOKEN = "JWT Token has expired";

    private JWTConstant() {
        // Prevent instantiation
    }
}
