package com.scrapyard.management.Services;

public interface IPasswordRecoveryService {

    String requestReset(String email);

    String resetPassword(String token, String newPassword);
}
