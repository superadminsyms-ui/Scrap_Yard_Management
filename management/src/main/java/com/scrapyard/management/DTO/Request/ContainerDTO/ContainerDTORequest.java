package com.scrapyard.management.DTO.Request.ContainerDTO;
import com.scrapyard.management.Models.Enums.ContainerSize;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.ScrapYard;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ContainerDTORequest {

    private String description;
    private BigDecimal materialWeight;
    private ContainerSize containerSize;
    private Long scrapYardId;
    private MaterialType materialType;

}
