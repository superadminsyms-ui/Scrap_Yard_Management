package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface ReportRepo extends JpaRepository <Report, Long> {

    Page<Report> findByScrapYardId(Long scrapYardId, Pageable pageable);

    Page<Report> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<Report> findByScrapYardIdAndCreatedAtBetween(Long scrapYardId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    boolean existsByScrapYardIdAndCreatedAtBetween(Long scrapYardId, LocalDateTime start, LocalDateTime end);
}
