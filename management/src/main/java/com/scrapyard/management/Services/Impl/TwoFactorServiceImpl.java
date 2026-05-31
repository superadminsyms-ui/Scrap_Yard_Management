package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.DTO.Response.AuthDTO.Setup2FAResponse;
import com.scrapyard.management.DTO.Response.AuthDTO.TwoFAStatusResponse;
import com.scrapyard.management.Models.User;
import com.scrapyard.management.Repository.UserRepo;
import com.scrapyard.management.Services.ITwoFactorService;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TwoFactorServiceImpl implements ITwoFactorService {

    private static final Logger log = LoggerFactory.getLogger(TwoFactorServiceImpl.class);
    private static final String ISSUER = "SY Management";

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final GoogleAuthenticator googleAuthenticator;

    public TwoFactorServiceImpl(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.googleAuthenticator = new GoogleAuthenticator();
    }

    @Override
    public Setup2FAResponse setup(User user) {
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new IllegalArgumentException("2FA is already enabled. Disable it first to set up again.");
        }

        var credentials = googleAuthenticator.createCredentials();

        user.setTwoFactorSecret(credentials.getKey());
        user.setTwoFactorSetupDate(LocalDateTime.now());
        userRepo.save(user);

        String qrCodeUrl = String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                ISSUER, user.getEmail(), credentials.getKey(), ISSUER);

        Setup2FAResponse response = new Setup2FAResponse();
        response.setSecret(credentials.getKey());
        response.setQrCodeUrl(qrCodeUrl);
        return response;
    }

    @Override
    @Transactional
    public void enable(User user, String code) {
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new IllegalArgumentException("2FA is already enabled");
        }

        if (user.getTwoFactorSecret() == null || user.getTwoFactorSecret().isBlank()) {
            throw new IllegalArgumentException("2FA setup has not been initiated. Call setup first.");
        }

        if (!verifyCode(user, code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        user.setTwoFactorEnabled(true);
        userRepo.save(user);
        log.info("2FA enabled for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void disable(User user, String currentPassword, String code) {
        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new IllegalArgumentException("2FA is not enabled");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new AccessDeniedException("Invalid password");
        }

        if (!verifyCode(user, code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setTwoFactorSetupDate(null);
        userRepo.save(user);
        log.info("2FA disabled for user: {}", user.getEmail());
    }

    @Override
    public TwoFAStatusResponse getStatus(User user) {
        return new TwoFAStatusResponse(Boolean.TRUE.equals(user.getTwoFactorEnabled()));
    }

    @Override
    public boolean verifyCode(User user, String code) {
        if (user.getTwoFactorSecret() == null || user.getTwoFactorSecret().isBlank()) {
            return false;
        }

        try {
            int providedCode = Integer.parseInt(code);
            return googleAuthenticator.authorize(user.getTwoFactorSecret(), providedCode);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @Override
    public void verifyRequired(User user, String code) {
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            if (code == null || code.isBlank()) {
                throw new AccessDeniedException("2FA verification code is required");
            }
            if (!verifyCode(user, code)) {
                throw new AccessDeniedException("Invalid 2FA verification code");
            }
        }
    }
}
