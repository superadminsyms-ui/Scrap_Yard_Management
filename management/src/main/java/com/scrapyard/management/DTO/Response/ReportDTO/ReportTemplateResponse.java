package com.scrapyard.management.DTO.Response.ReportDTO;
import com.scrapyard.management.Models.Enums.MaterialType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReportTemplateResponse {
    private List<ReportDetailTemplate> reportDetails;
    private BigDecimal totalDiscount;

    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class ReportDetailTemplate {
        private MaterialType materialType;
        private Long containerId;
        private BigDecimal weight;
        private BigDecimal unitPrice;
    }
}
