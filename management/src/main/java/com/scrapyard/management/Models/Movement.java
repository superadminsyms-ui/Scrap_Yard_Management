package com.scrapyard.management.Models;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.MovementType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

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
    @JoinColumn(name = "originContainer_id", nullable = false)
    private Container originContainer;

    // Campo opcional para indicar destino cuando es un patio registrado
    @ManyToOne
    @JoinColumn(name = "destinationContainer_id")
    private Container destinationContainer;

    // Para destinos no registrados en el sistema
    @Column(name = "notTrackDestination")
    private String notTrackDestination;

    // Cantidad de material movida
    @Column(nullable = false)
    private Double amount_moved;

    //tipo de material movido
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MaterialType materialType;

    //unidad de pesaje del movimiento
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UnitOfMeasure unitOfMeasure;

    @Column(nullable = false)
    private LocalDateTime movementDate;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private ManagerSY managerSY;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MovementType movementType;

}
