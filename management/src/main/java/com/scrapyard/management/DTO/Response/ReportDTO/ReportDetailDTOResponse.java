package com.scrapyard.management.DTO.Response.ReportDTO;


import com.scrapyard.management.Models.Enums.MaterialType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReportDetailDTOResponse {

    private MaterialType materialType;
    private BigDecimal weight;
    private BigDecimal unitPrice;

}
