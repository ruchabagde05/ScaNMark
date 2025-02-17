package com.cdac.scanmark.controller;

import com.cdac.scanmark.dto.QRSigningRequest;
import com.cdac.scanmark.dto.QRSigningResponse;
import com.cdac.scanmark.service.QRSigningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
public class QRSigningController {
    
    private final QRSigningService qrSigningService;

    public QRSigningController(QRSigningService qrSigningService) {
        this.qrSigningService = qrSigningService;
    }

    @PostMapping("/sign")
    public ResponseEntity<QRSigningResponse> signQRContent(
            @RequestBody QRSigningRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String qrContent = String.format("%s|%s|%f|%f",
                request.getLectureId(),
                request.getTimestamp(),
                request.getLatitude(),
                request.getLongitude());

            String signedContent = qrSigningService.signQRContent(qrContent, request.getStudentPrn());
            
            return ResponseEntity.ok(new QRSigningResponse(signedContent));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new QRSigningResponse("Error signing QR content: " + e.getMessage()));
        }
    }
}
