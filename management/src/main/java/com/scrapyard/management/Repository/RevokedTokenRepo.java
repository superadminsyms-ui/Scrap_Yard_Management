package com.scrapyard.management.Repository;

import com.scrapyard.management.Models.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface RevokedTokenRepo extends JpaRepository<RevokedToken, String> {

    boolean existsByJti(String jti);

    void deleteByExpiresAtBefore(LocalDateTime cutoff);
}
