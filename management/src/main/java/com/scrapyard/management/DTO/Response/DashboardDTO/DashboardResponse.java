package com.scrapyard.management.DTO.Response.DashboardDTO;

import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse1;
import com.scrapyard.management.DTO.Response.MovementDTO.MovementDTOResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private Long totalCompanies;
    private Long totalScrapyards;
    private Long totalContainers;
    private Long totalCustomers;
    private Long totalInvoices;
    private Long totalMovements;
    private BigDecimal totalSpent;
    private List<InvoiceDTOResponse1> recentInvoices;
    private List<MovementDTOResponse> recentMovements;
    private String scrapyardName;
    private String scrapyardLocation;
}
