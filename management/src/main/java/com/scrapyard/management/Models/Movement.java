package com.scrapyard.management.Models;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.MovementType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movement")
public class Movement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "scrapyard_id", nullable = false)
    private ScrapYard scrapYard;

    @ManyToOne
    @JoinColumn(name = "container_id", nullable = false)
    private Container container;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private BigDecimal amountMoved;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UnitOfMeasure unitOfMeasure;

    @Column(nullable = false)
    private LocalDateTime movementDate = LocalDateTime.now(ZoneOffset.UTC);

    @ManyToOne(optional = false)
    @JoinColumn(name = "manager_id", nullable = false)
    private ManagerSY managerSY;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MovementType movementType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType materialType;

}
