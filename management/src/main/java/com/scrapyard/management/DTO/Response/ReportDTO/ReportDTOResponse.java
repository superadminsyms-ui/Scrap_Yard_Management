package com.scrapyard.management.DTO.Response.ReportDTO;
import com.scrapyard.management.DTO.Request.ReportDTO.ReportDetailDTORequestInsert;
import com.scrapyard.management.DTO.Request.ReportDTO.SpendDTORequestInsert;
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
    private String managerName;
    private BigDecimal startingBalance;
    private BigDecimal addedMoney;
    private List<ReportDetailDTORequestInsert> reportDetails;
    private BigDecimal balance;
    private List<SpendDTORequestInsert> spends;
    private String notes;

}
