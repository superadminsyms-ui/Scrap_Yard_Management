package com.scrapyard.management.DTO.Response.ScrapYardDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ScrapYardStockTotalResponse {
    private Long scrapYardId;
    private String scrapYardName;
    private BigDecimal totalWeight;
    private Integer containerCount;
    private List<MaterialStock> materialBreakdown;
    private String weightUnit;
}
