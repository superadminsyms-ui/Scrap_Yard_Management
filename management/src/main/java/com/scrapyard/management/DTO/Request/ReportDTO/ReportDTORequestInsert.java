package com.scrapyard.management.DTO.Request.ReportDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReportDTORequestInsert {

    @NotNull(message = "scrapYardId is required")
    @Positive(message = "scrapYardId must be a positive number")
    private Long scrapYardId;

    private Long managerId;

    @NotNull(message = "Starting balance is required")
    @DecimalMin(value = "0.0", message = "Starting balance cannot be negative")
    @DecimalMax(value = "1000000000.0", message = "Starting balance exceeds the maximum allowed value")
    private BigDecimal startingBalance;

    @DecimalMin(value = "0.0", message = "Added money cannot be negative")
    @DecimalMax(value = "1000000000.0", message = "Added money exceeds the maximum allowed value")
    private BigDecimal addedMoney;

    @NotNull(message = "Total invested is required")
    @Positive(message = "Total invested must be a positive number")
    @DecimalMax(value = "1000000000.0", message = "Total invested exceeds the maximum allowed value")
    private BigDecimal totalInvested;

    @NotNull(message = "Balance is required")
    @PositiveOrZero
    @DecimalMax(value = "1000000000.0", message = "Balance exceeds the maximum allowed value")
    private BigDecimal balance;

    @NotEmpty(message = "details must contain at least one detail")
    @Valid
    private List<ReportDetailDTORequestInsert> reportDetails;

    @Valid
    private List<SpendDTORequestInsert> spends;

    @DecimalMax(value = "1000000000.0", message = "Total discount exceeds the maximum allowed value")
    private BigDecimal totalDiscount;

    @Size(max = 200, message = "notes must be at most 200 characters")
    private String notes;

}
