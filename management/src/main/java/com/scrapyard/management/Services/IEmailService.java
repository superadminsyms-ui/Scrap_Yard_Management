package com.scrapyard.management.Services;

public interface IEmailService {

    void sendPasswordResetEmail(String to, String resetLink);
}
