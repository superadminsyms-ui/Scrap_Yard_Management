package com.scrapyard.management.Services;

public interface ITokenRevocationService {

    void revoke(String jti, String userEmail, java.time.LocalDateTime expiresAt);

    boolean isRevoked(String jti);

    void cleanupExpired();
}
