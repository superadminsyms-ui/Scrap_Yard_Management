package com.scrapyard.management.DTO.Response.InvoiceDTO;
import com.scrapyard.management.Models.Enums.CustomerType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InvoiceDTOResponse1 {

    private Long invoiceId;
    private String customerName;
    private CustomerType customerType;
    private String scrapyardName;
    private Long scrapyardId;
    private LocalDateTime createdAt;
    private BigDecimal totalPaid;
    private BigDecimal discount;

}
