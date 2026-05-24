package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

}
