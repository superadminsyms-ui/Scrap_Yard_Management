package com.scrapyard.management.Models;
import com.scrapyard.management.Models.Enums.TypeMetal;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "container")
public class Container {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal currentWeight = BigDecimal.ZERO;

    private Double capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeMetal metalType;

    @ManyToOne
    @JoinColumn(name = "scrapyard_id", nullable = false)
    private ScrapYard scrapYard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitOfMeasure stockUnit = UnitOfMeasure.KILOGRAMS;









}
