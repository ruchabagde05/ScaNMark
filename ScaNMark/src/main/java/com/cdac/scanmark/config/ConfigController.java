package com.cdac.scanmark.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/config")
public class ConfigController {

    @GetMapping("/ngrok-url")
    public ResponseEntity<String> getNgrokUrlDynamically() {
        String ngrok = System.getenv("NGROK_URL"); // Dynamically fetch NGROK_URL.
        if (ngrok == null || ngrok.isEmpty()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Ngrok tunnel URL not available.");
        }
        return ResponseEntity.ok(ngrok);
    }
}