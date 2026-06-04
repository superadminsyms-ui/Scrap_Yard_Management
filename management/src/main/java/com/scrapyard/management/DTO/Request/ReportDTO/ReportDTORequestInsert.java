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

    @NotNull(message = "managerId is required")
    @Positive(message = "managerId must be a positive number")
    private Long managerId;

    @NotNull(message = "Starting balance is required")
    @DecimalMin(value = "0.0", message = "Starting balance cannot be negative")
    private BigDecimal startingBalance;

    @DecimalMin(value = "0.0", message = "Added money cannot be negative")
    private BigDecimal addedMoney;

    @NotNull(message = "Total invested is required")
    @Positive(message = "Total invested must be a positive number")
    private BigDecimal totalInvested;

    @NotNull(message = "Balance is required")
    @PositiveOrZero
    private BigDecimal balance;

    @NotEmpty(message = "details must contain at least one detail")
    @Valid
    private List<ReportDetailDTORequestInsert> reportDetails;

    @NotEmpty(message = "spends must contain at least one detail")
    @Valid
    private List<SpendDTORequestInsert> spends;

    @Size(min = 2, max = 200, message = "notes must be between 2 and 100 characters")
    private String notes;

}
