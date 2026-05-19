package com.scrapyard.management.DTO.Request.MovementDTO;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.MovementType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovementDTORequestInsert {

    @NotNull(message = "ScrapYard ID is required")
    @Positive(message = "ScrapYard ID must be a positive number")
    private Long scrapYardId;

    @NotNull(message = "Container ID is required")
    @Positive(message = "Container ID must be a positive number")
    private Long containerId;

    @NotNull(message = "Destination is required")
    private String destination;

    @NotNull(message = "Amount moved is required")
    @Positive(message = "Amount moved must be a positive number")
    private BigDecimal amountMoved;

    @NotNull(message = "Unit of measure is required")
    private UnitOfMeasure unitOfMeasure;

    @NotNull(message = "Material type is required")
    private MaterialType materialType;

    @NotNull(message = "Manager ID is required")
    @Positive(message = "Manager ID must be a positive number")
    private Long managerId;

    @NotNull(message = "Movement type is required")
    private MovementType movementType;
}
