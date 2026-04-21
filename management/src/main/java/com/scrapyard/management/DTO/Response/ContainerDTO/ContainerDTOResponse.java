package com.scrapyard.management.DTO.Response.ContainerDTO;
import com.scrapyard.management.Models.Enums.ContainerSize;
import com.scrapyard.management.Models.Enums.MaterialType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ContainerDTOResponse {

   private MaterialType materialType;
   private ContainerSize containerSize;
   private Double materialWeight;

}
