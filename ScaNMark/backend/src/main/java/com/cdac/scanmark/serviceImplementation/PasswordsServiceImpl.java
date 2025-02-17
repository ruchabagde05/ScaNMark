package com.cdac.scanmark.serviceImplementation;

import com.cdac.scanmark.entities.Passwords;
import com.cdac.scanmark.repository.PasswordsRepository;
import com.cdac.scanmark.service.PasswordsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordsServiceImpl implements PasswordsService {

    private final PasswordsRepository passwordsRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordsServiceImpl(PasswordsRepository passwordsRepository, PasswordEncoder passwordEncoder) {
        this.passwordsRepository = passwordsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Passwords getPasswordByUserId(Long userId) {
        return passwordsRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Password not found for user ID " + userId));
    }

    @Override
    public Passwords savePassword(Passwords password) {
        // Encrypt the password before saving
        password.setPassword(passwordEncoder.encode(password.getPassword()));
        return passwordsRepository.save(password);
    }

    @Override
    public Passwords updatePassword(Long userId, String newPassword) {
        Passwords existingPassword = passwordsRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Password not found for user ID " + userId));

        // Encrypt the new password before updating
        existingPassword.setPassword(passwordEncoder.encode(newPassword));
        return passwordsRepository.save(existingPassword);
    }

    @Override
    public void deletePassword(Long userId) {
        passwordsRepository.deleteById(userId);
    }
}
