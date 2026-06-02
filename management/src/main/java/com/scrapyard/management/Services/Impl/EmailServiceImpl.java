package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.Services.IEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements IEmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        if (fromEmail == null || fromEmail.isBlank()) {
            logger.warn("Cannot send email: MAIL_USERNAME is not configured");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("ScrapYard Management System- Password Reset");
            message.setText("""
                Hello,

                A password reset request has been made for your account.

                Click the link below to reset your password:
                %s

                This link will expire in 10 minutes.

                If you did not request a password reset, you can safely ignore this email.

                ScrapYard Management System
                """.formatted(resetLink));

            mailSender.send(message);
            logger.info("Password reset email sent to {}", to);
        } catch (MailException e) {
            logger.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }
}
