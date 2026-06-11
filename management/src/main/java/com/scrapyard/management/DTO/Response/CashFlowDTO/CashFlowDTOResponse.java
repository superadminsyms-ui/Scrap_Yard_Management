package com.scrapyard.management.DTO.Response.CashFlowDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CashFlowDTOResponse {

private Long id;
private LocalDateTime createdAt;
private String scrapYardName;
private String managerName;
private BigDecimal startingBalance;
private BigDecimal cashReceived;
private String cashReceivedFrom;
private BigDecimal totalSpendInDay;
private BigDecimal totalBalance;


}
