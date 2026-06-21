package com.scrapyard.management.DTO.Request.MovementDTO;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.MovementType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
    @Size(max = 200, message = "Destination must be at most 200 characters")
    private String destination;

    @NotNull(message = "Amount moved is required")
    @Positive(message = "Amount moved must be a positive number")
    @DecimalMax(value = "1000000000.0", message = "Amount moved exceeds the maximum allowed value")
    private BigDecimal amountMoved;

    @NotNull(message = "Unit of measure is required")
    private UnitOfMeasure unitOfMeasure;

    @NotNull(message = "Material type is required")
    private MaterialType materialType;

    private Long managerId;

    @NotNull(message = "Movement type is required")
    private MovementType movementType;
}
