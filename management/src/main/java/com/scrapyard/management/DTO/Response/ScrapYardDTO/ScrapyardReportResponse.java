package com.scrapyard.management.DTO.Response.ScrapYardDTO;

import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse1;
import com.scrapyard.management.Models.Enums.ReportPeriod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ScrapyardReportResponse {
    private Long scrapyardId;
    private String scrapyardName;
    private String reportType;
    private ReportPeriod period;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal totalInvested;
    private Integer invoiceCount;
    private List<InvoiceDTOResponse1> invoices;
    private List<MaterialPricing> materialPricing;
}
