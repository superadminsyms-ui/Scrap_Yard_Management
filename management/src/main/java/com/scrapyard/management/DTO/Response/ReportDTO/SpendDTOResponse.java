package com.scrapyard.management.DTO.Response.ReportDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SpendDTOResponse {

    private BigDecimal amount;
    private String description;

}
