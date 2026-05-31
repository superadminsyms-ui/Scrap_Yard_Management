package com.scrapyard.management.DTO.Request.ContainerDTO;
import com.scrapyard.management.Models.Enums.ContainerSize;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ContainerDTORequest {


    @NotBlank(message = "Description is required")
    @Size(max = 200, message = "Description must be at most 200 characters")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "Only letters are allowed")
    private String description;

    @NotNull(message = "Material weight is required")
    @DecimalMin(value = "0.01", message = "Material weight must be positive")
    private BigDecimal materialWeight;

    @NotNull(message = "Size is required")
    private ContainerSize containerSize;

    @NotNull(message = "ScrapYardId is required")
    @Positive(message = "ScrapYardId must be a positive number")
    private Long scrapYardId;

    @NotNull(message = "Material type is required")
    private MaterialType materialType;

    @NotNull(message = "Unit of measure is required")
    private UnitOfMeasure unitOfMeasure;

}
