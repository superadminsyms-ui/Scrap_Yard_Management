package com.scrapyard.management.DTO.Response.MovementDTO;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.MovementType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovementDTOResponse {
    private Long id;
    private String scrapYardName;
    private Long containerId;
    private String containerDescription;
    private MaterialType materialType;
    private String destination;
    private BigDecimal amountMoved;
    private UnitOfMeasure unitOfMeasure;
    private BigDecimal amountMovedLbs;
    private LocalDateTime movementDate;
    private String managerName;
    private MovementType movementType;
}
