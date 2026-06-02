package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface InvoiceRepo extends JpaRepository<Invoice,Long> {


    @Query("""
        SELECT i
        FROM Invoice i
        WHERE i.customer.id = :customerId
    """)
    List<Invoice> findByCustomerId(Long customerId);

    boolean existsByManagerId(Long managerId);

    @EntityGraph(attributePaths = {"customer", "scrapYard", "manager", "details", "details.container"})
    @Query("""
        SELECT i
        FROM Invoice i
        WHERE i.scrapYard.id = :yardId
          AND i.createdAt >= :startDate
          AND i.createdAt <= :endDate
    """)
    List<Invoice> findByScrapYardIdAndCreatedAtBetween(Long yardId, LocalDateTime startDate, LocalDateTime endDate);

    @EntityGraph(attributePaths = {"customer", "scrapYard"})
    Page<Invoice> findByCustomerId(Long customerId, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "scrapYard"})
    Page<Invoice> findByScrapYardId(Long scrapYardId, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "scrapYard"})
    Page<Invoice> findByCustomerIdAndScrapYardId(Long customerId, Long scrapYardId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"customer", "scrapYard"})
    Page<Invoice> findAll(Pageable pageable);

    long countByScrapYardId(Long scrapYardId);

    @Query("SELECT COALESCE(SUM(i.totalPaid), 0) FROM Invoice i WHERE i.scrapYard.id = :yardId")
    BigDecimal sumTotalPaidByScrapYardId(@Param("yardId") Long yardId);

    @Query("SELECT COALESCE(SUM(i.totalPaid), 0) FROM Invoice i")
    BigDecimal sumTotalPaid();

    @EntityGraph(attributePaths = {"customer", "scrapYard"})
    List<Invoice> findTop5ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"customer", "scrapYard"})
    List<Invoice> findTop5ByScrapYardIdOrderByCreatedAtDesc(Long scrapYardId);

    @EntityGraph(attributePaths = {"customer", "scrapYard", "manager", "details", "details.container"})
    Optional<Invoice> findWithDetailsById(Long id);
}
