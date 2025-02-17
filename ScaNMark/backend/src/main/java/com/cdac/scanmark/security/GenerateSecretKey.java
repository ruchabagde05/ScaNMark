package com.cdac.scanmark.security;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;

public class GenerateSecretKey {

    public static void main(String[] args) {
        // Generate the key for HS512
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

        // Print out the Base64 encoded key (you can use this for your configuration)
        String base64Key = java.util.Base64.getEncoder().encodeToString(key.getEncoded());

        System.out.println("Generated Base64 Encoded Key: " + base64Key);
    }
}

