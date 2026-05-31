package com.scrapyard.management.Models;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoice", indexes = {
    @Index(name = "idx_invoice_customer_id", columnList = "customer_id"),
    @Index(name = "idx_invoice_scrapyard_id", columnList = "scrapyard_id"),
    @Index(name = "idx_invoice_scrapyard_created", columnList = "scrapyard_id,created_at"),
    @Index(name = "idx_invoice_manager_id", columnList = "manager_id")
})
public class Invoice {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    // Customer who going to sell material
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Scrapyard who buy material
    @ManyToOne
    @JoinColumn(name = "scrapyard_id", nullable = false)
    private ScrapYard scrapYard;

    // Transaction date
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Invoice details (for each metal purchased)
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvoiceDetail> details=new ArrayList<>();

    // Invoice totals
    @Column(nullable = false)
    private BigDecimal totalPaid;

    // Invoice discount
    @Column
    private BigDecimal discount;

    @PrePersist
    private void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "manager_id", nullable = false)
    private ManagerSY manager;

}
