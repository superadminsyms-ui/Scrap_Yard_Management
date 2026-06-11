package com.scrapyard.management.Models;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cash_flow")
public class CashFlow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "scrapyard_id", nullable = false)
    private ScrapYard scrapYard;

    @ManyToOne
    @JoinColumn(name = "manager_id", nullable = false)
    private ManagerSY manager;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private BigDecimal startingBalance;

    @Column(nullable = false)
    private BigDecimal cashReceived;

    @NotBlank
    @Size(max = 75)
    @Column(nullable = false)
    private String cashReceivedFrom;

    @Column(nullable = false)
    private BigDecimal totalSpendInDay;

    @Column(nullable = false)
    private BigDecimal totalBalance;

    @PrePersist
    private void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.totalBalance = this.startingBalance.add(this.cashReceived).subtract(this.totalSpendInDay);
    }

}
