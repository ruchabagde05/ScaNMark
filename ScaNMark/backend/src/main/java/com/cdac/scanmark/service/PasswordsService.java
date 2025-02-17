package com.cdac.scanmark.service;

import com.cdac.scanmark.entities.Passwords;

public interface PasswordsService {

    // Get password by user id (student/faculty/coordinator)
    Passwords getPasswordByUserId(Long userId);

    // Save password for user
    Passwords savePassword(Passwords password);

    // Update password for user
    Passwords updatePassword(Long userId, String newPassword);

    // Delete password for user
    void deletePassword(Long userId);
}
