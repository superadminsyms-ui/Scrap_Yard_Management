package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.Models.PasswordResetToken;
import com.scrapyard.management.Models.User;
import com.scrapyard.management.Repository.PasswordResetTokenRepo;
import com.scrapyard.management.Repository.UserRepo;
import com.scrapyard.management.Services.IEmailService;
import com.scrapyard.management.Services.IPasswordRecoveryService;
import com.scrapyard.management.Utils.PasswordValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordRecoveryServiceImpl implements IPasswordRecoveryService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordRecoveryServiceImpl.class);

    private final UserRepo userRepo;
    private final PasswordResetTokenRepo tokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;

    @Value("${app.password-reset.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.password-reset.token-expiration-minutes:30}")
    private int tokenExpirationMinutes;

    @Autowired
    public PasswordRecoveryServiceImpl(UserRepo userRepo,
                                       PasswordResetTokenRepo tokenRepo,
                                       PasswordEncoder passwordEncoder,
                                       IEmailService emailService) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public String requestReset(String email) {
        User user = userRepo.findByEmail(email).orElse(null);

        if (user == null || !user.isActive()) {
            logger.info("Password reset requested for non-existent or inactive email: {}", email);
            return "If that email exists in our system, a reset link has been sent.";
        }

        tokenRepo.deleteByUser(user);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(tokenExpirationMinutes));
        resetToken.setUsed(false);
        tokenRepo.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + resetToken.getToken();
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

        logger.info("Password reset token generated for user {}", user.getEmail());
        return "If that email exists in our system, a reset link has been sent.";
    }

    @Override
    @Transactional
    public String resetPassword(String token, String newPassword) {
        PasswordValidator.validate(newPassword);

        PasswordResetToken resetToken = tokenRepo.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This reset token has already been used.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is deactivated. Cannot reset password.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepo.save(user);

        resetToken.setUsed(true);
        tokenRepo.save(resetToken);

        logger.info("Password reset successfully for user {}", user.getEmail());
        return "Password has been reset successfully. You may now log in.";
    }

    @Scheduled(fixedRateString = "${app.password-reset.cleanup-rate-ms:3600000}")
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = tokenRepo.deleteAllExpiredSince(LocalDateTime.now());
        if (deleted > 0) {
            logger.info("Cleaned up {} expired password reset tokens", deleted);
        }
    }
}
