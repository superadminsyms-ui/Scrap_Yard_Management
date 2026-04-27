package com.scrapyard.management.DTO.Response.ContainerDTO;
import com.scrapyard.management.Models.Enums.ContainerSize;
import com.scrapyard.management.Models.Enums.MaterialType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ContainerDTOResponse {


   private String description;
   private MaterialType materialType;
   private ContainerSize containerSize;
   private BigDecimal materialWeight;

}
