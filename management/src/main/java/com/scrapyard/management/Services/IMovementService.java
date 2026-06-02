package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.MovementDTO.MovementDTORequestInsert;
import com.scrapyard.management.DTO.Response.MovementDTO.MovementDTOResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IMovementService {
    MovementDTOResponse createMovement(MovementDTORequestInsert dto);
    Page<MovementDTOResponse> getAllMovements(Pageable pageable);
    MovementDTOResponse getMovementById(Long id);
    Page<MovementDTOResponse> getMovementsByScrapYard(Long yardId, Pageable pageable);
    Page<MovementDTOResponse> getMovementsByContainer(Long containerId, Pageable pageable);
}
