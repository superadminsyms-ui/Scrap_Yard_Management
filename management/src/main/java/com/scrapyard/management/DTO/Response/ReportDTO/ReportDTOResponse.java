package com.scrapyard.management.DTO.Response.ReportDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReportDTOResponse {

    private LocalDateTime createdAt;
    private Long scrapYardId;
    private String scrapYardName;
    private String companyName;
    private String managerName;
    private BigDecimal startingBalance;
    private BigDecimal addedMoney;
    private BigDecimal totalInvested;
    private List<ReportDetailDTOResponse> reportDetails;
    private BigDecimal balance;
    private List<SpendDTOResponse> spends;
    private String notes;

}
