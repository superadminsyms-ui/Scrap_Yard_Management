package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


public interface InvoiceRepo extends JpaRepository<Invoice,Long> {


    @Query("""
        SELECT i
        FROM Invoice i
        WHERE i.customer.id = :customerId
    """)
    List<Invoice> findByCustomerId(Long customerId);

    boolean existsByManagerId(Long managerId);

    @Query("""
        SELECT i
        FROM Invoice i
        WHERE i.scrapYard.id = :yardId
          AND i.createdAt >= :startDate
          AND i.createdAt <= :endDate
    """)
    List<Invoice> findByScrapYardIdAndCreatedAtBetween(Long yardId, LocalDateTime startDate, LocalDateTime endDate);

    Page<Invoice> findByCustomerId(Long customerId, Pageable pageable);
    Page<Invoice> findByScrapYardId(Long scrapYardId, Pageable pageable);

    long countByScrapYardId(Long scrapYardId);

    @Query("SELECT COALESCE(SUM(i.totalPaid), 0) FROM Invoice i WHERE i.scrapYard.id = :yardId")
    BigDecimal sumTotalPaidByScrapYardId(@Param("yardId") Long yardId);

    @Query("SELECT COALESCE(SUM(i.totalPaid), 0) FROM Invoice i")
    BigDecimal sumTotalPaid();

    List<Invoice> findTop5ByOrderByCreatedAtDesc();
    List<Invoice> findTop5ByScrapYardIdOrderByCreatedAtDesc(Long scrapYardId);
}
