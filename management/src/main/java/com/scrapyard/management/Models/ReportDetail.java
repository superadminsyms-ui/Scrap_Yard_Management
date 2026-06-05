package com.scrapyard.management.Models;
import com.scrapyard.management.Models.Enums.MaterialType;
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
@Table(name = "reportDetail")
public class ReportDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType materialType;

    @Column(nullable = false)
    private BigDecimal weight;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;

}
