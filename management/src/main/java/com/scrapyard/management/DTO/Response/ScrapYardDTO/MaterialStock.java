package com.scrapyard.management.DTO.Response.ScrapYardDTO;
import com.scrapyard.management.Models.Enums.MaterialType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MaterialStock {
    private MaterialType materialType;
    private BigDecimal totalWeight;
    private Integer containerCount;
    private String weightUnit;
}
