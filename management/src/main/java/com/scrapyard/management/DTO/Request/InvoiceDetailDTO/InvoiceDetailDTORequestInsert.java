package com.scrapyard.management.DTO.Request.InvoiceDetailDTO;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;



@AllArgsConstructor
@NoArgsConstructor
@Data
public class InvoiceDetailDTORequestInsert {

    @NotNull(message = "Type is required")
    private MaterialType materialType;

    @NotNull(message = "Unit is required")
    private UnitOfMeasure unit;

    @NotNull(message = "weight is required")
    @Positive(message = "weight must be a positive number")
    @DecimalMax(value = "1000000000.0", message = "weight exceeds the maximum allowed value")
    private BigDecimal weight;

    @NotNull(message = "unitPrice is required")
    @Positive(message = "unitPrice must be a positive number")
    @DecimalMax(value = "1000000000.0", message = "unitPrice exceeds the maximum allowed value")
    private BigDecimal unitPrice;

    @NotNull(message = "containerId is required")
    @Positive(message = "containerId must be a positive number")
    private Long containerId;


}
