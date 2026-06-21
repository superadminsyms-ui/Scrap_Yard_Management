package com.scrapyard.management.DTO.Request.InvoiceDTO;
import com.scrapyard.management.DTO.Request.InvoiceDetailDTO.InvoiceDetailDTORequestInsert;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InvoiceDTORequestInsert {

    @NotNull(message = "customerId is required")
    @Positive(message = "customerId must be a positive number")
    private Long customerId;

    @NotNull(message = "scrapYardId is required")
    @Positive(message = "scrapYardId must be a positive number")
    private Long scrapYardId;

    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    @DecimalMax(value = "1000000000.0", message = "Discount exceeds the maximum allowed value")
    private BigDecimal discount;

    @NotEmpty(message = "details must contain at least one detail")
    @Valid
    private List<InvoiceDetailDTORequestInsert> details;

    @NotNull(message = "managerId is required")
    @Positive(message = "managerId must be a positive number")
    private Long managerId;

}
