package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.CashFlow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface CashFlowRepo extends JpaRepository<CashFlow,Long> {

    Optional<CashFlow> findTopByScrapYardIdOrderByCreatedAtDesc(Long scrapYardId);

    @EntityGraph(attributePaths = {"scrapYard", "manager"})
    Page<CashFlow> findByScrapYardId(Long scrapYardId, Pageable pageable);

    @EntityGraph(attributePaths = {"scrapYard", "manager"})
    Page<CashFlow> findByManagerId(Long managerId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"scrapYard", "manager"})
    Page<CashFlow> findAll(Pageable pageable);

    boolean existsByScrapYardIdAndCreatedAtBetween(Long scrapYardId, LocalDateTime start, LocalDateTime end);

}
