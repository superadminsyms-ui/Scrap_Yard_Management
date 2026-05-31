package com.scrapyard.management.Services;

import java.time.LocalDateTime;

public interface ITokenRevocationService {

    void revoke(String jti, String userEmail, LocalDateTime expiresAt);

    boolean isRevoked(String jti);

    void cleanupExpired();
}
