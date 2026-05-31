package com.scrapyard.management.Models;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "invoice_detail", indexes = {
    @Index(name = "idx_invoicedetail_invoice_id", columnList = "invoice_id"),
    @Index(name = "idx_invoicedetail_container_id", columnList = "container_id")
})
public class InvoiceDetail {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    // Relationship with invoice
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    // Type of metal purchased
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType materialType;

    //Unit of measure
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitOfMeasure unit;

    // Purchased weight
    @Column(nullable = false)
    private BigDecimal weight;

    // Price negotiated per kg/lb in that purchase
    @Column(nullable = false)
    private BigDecimal unitPrice;

    //Container
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id",nullable = false)
    private Container container;

    @Transient
    public BigDecimal getSubtotal() {
        if (weight == null || unitPrice == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(weight);
    }

}
