package com.cdac.scanmark.service;

import com.cdac.scanmark.entities.Student;
import com.cdac.scanmark.repository.StudentRepository;
import org.springframework.stereotype.Service;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Service
public class QRSigningService {
    
    private final StudentRepository studentRepository;

    public QRSigningService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public String signQRContent(String qrContent, Long studentPrn) throws Exception {
        Student student = studentRepository.findByPrn(studentPrn)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getPrivateKey() == null) {
            throw new RuntimeException("Student private key not found");
        }

        // Decode private key
        PrivateKey privateKey = decodePrivateKey(student.getPrivateKey());

        // Sign the content
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(privateKey);
        signature.update(qrContent.getBytes());

        byte[] signedBytes = signature.sign();
        String signatureBase64 = Base64.getEncoder().encodeToString(signedBytes);

        // Return QR content with signature
        return qrContent + "|" + signatureBase64;
    }

    private PrivateKey decodePrivateKey(String privateKeyString) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(privateKeyString);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(spec);
    }
}