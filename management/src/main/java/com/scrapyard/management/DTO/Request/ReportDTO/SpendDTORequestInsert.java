package com.scrapyard.management.DTO.Request.ReportDTO;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SpendDTORequestInsert {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal amount;

    @NotBlank(message = "description is required")
    @Size(min = 2, max = 100, message = "description must be between 2 and 100 characters")
    private String description;

}
