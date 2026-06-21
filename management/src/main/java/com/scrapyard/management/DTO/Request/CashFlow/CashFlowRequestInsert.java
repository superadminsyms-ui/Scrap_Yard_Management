package com.scrapyard.management.DTO.Request.CashFlow;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CashFlowRequestInsert {

    @NotNull(message = "scrapYardId is required")
    @Positive(message = "scrapYardId must be a positive number")
    private Long scrapYardId;

    @NotNull(message = "managerId is required")
    @Positive(message = "managerId must be a positive number")
    private Long managerId;

    @NotNull(message = "startingBalance is required")
    @DecimalMin(value = "0.0", message = "Starting balance cannot be negative")
    @DecimalMax(value = "1000000000.0", message = "Starting balance exceeds the maximum allowed value")
    private BigDecimal startingBalance;

    @NotNull(message = "cashReceived is required")
    @DecimalMin(value = "0.0", message = "Cash received cannot be negative")
    @DecimalMax(value = "1000000000.0", message = "Cash received exceeds the maximum allowed value")
    private BigDecimal cashReceived;

    @Size(max = 75, message = "cashReceivedFrom must be at most 75 characters")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ()+]*$", message = "cashReceivedFrom contains invalid characters")
    private String cashReceivedFrom;

    @NotNull(message = "totalSpendInDay is required")
    @DecimalMin(value = "0.0", message = "Spend cannot be negative")
    @DecimalMax(value = "1000000000.0", message = "Spend exceeds the maximum allowed value")
    private BigDecimal totalSpendInDay;

    @AssertTrue(message = "Total spend cannot exceed starting balance + cash received")
    public boolean isTotalSpendValid() {
        if (startingBalance == null || cashReceived == null || totalSpendInDay == null) return true;
        return startingBalance.add(cashReceived).compareTo(totalSpendInDay) >= 0;
    }

}
