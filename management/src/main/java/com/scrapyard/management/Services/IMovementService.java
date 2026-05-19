package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.MovementDTO.MovementDTORequestInsert;
import com.scrapyard.management.DTO.Response.MovementDTO.MovementDTOResponse;
import java.util.List;

public interface IMovementService {
    MovementDTOResponse createMovement(MovementDTORequestInsert dto);
    List<MovementDTOResponse> getAllMovements();
    MovementDTOResponse getMovementById(Long id);
    List<MovementDTOResponse> getMovementsByScrapYard(Long yardId);
    List<MovementDTOResponse> getMovementsByContainer(Long containerId);
}
