package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.Models.RevokedToken;
import com.scrapyard.management.Repository.RevokedTokenRepo;
import com.scrapyard.management.Services.ITokenRevocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TokenRevocationServiceImpl implements ITokenRevocationService {

    private static final Logger log = LoggerFactory.getLogger(TokenRevocationServiceImpl.class);

    private final RevokedTokenRepo revokedTokenRepo;

    public TokenRevocationServiceImpl(RevokedTokenRepo revokedTokenRepo) {
        this.revokedTokenRepo = revokedTokenRepo;
    }

    @Override
    @Transactional
    public void revoke(String jti, String userEmail, LocalDateTime expiresAt) {
        if (revokedTokenRepo.existsByJti(jti)) {
            return;
        }

        RevokedToken revoked = new RevokedToken();
        revoked.setJti(jti);
        revoked.setUserEmail(userEmail);
        revoked.setRevokedAt(LocalDateTime.now());
        revoked.setExpiresAt(expiresAt);
        revokedTokenRepo.save(revoked);

        log.info("Token revoked for user: {}", userEmail);
    }

    @Override
    public boolean isRevoked(String jti) {
        return jti != null && !jti.isBlank() && revokedTokenRepo.existsByJti(jti);
    }

    @Override
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpired() {
        try {
            revokedTokenRepo.deleteByExpiresAtBefore(LocalDateTime.now());
        } catch (Exception e) {
            log.warn("Failed to cleanup expired tokens: {}", e.getMessage());
        }
    }
}
