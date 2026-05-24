package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.MovementDTO.MovementDTORequestInsert;
import com.scrapyard.management.DTO.Response.MovementDTO.MovementDTOResponse;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.ManagerSY;
import com.scrapyard.management.Models.Movement;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Models.Enums.MovementType;
import com.scrapyard.management.Repository.ContainerRepo;
import com.scrapyard.management.Repository.ManagerSYRepo;
import com.scrapyard.management.Repository.MovementRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class MovementServImpl implements IMovementService {

    @Autowired
    private final MovementRepo movementRepo;
    @Autowired
    private final ScrapYardRepo scrapYardRepo;
    @Autowired
    private final ContainerRepo containerRepo;
    @Autowired
    private final ManagerSYRepo managerSYRepo;

    @Autowired
    private final SecurityContextService securityContextService;

    public MovementServImpl(MovementRepo movementRepo, ScrapYardRepo scrapYardRepo, ContainerRepo containerRepo, ManagerSYRepo managerSYRepo, SecurityContextService securityContextService) {
        this.movementRepo = movementRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.containerRepo = containerRepo;
        this.managerSYRepo = managerSYRepo;
        this.securityContextService = securityContextService;
    }

    @Override
    public MovementDTOResponse createMovement(MovementDTORequestInsert dto) {
        Long yardId = securityContextService.getCurrentYardId();
        if (yardId != null) {
            dto.setScrapYardId(yardId);
            if (securityContextService.getCurrentUser() != null
                    && securityContextService.getCurrentUser().getManagerSY() != null) {
                dto.setManagerId(securityContextService.getCurrentUser().getManagerSY().getId());
            }
        }

        ScrapYard scrapYard = scrapYardRepo.findById(dto.getScrapYardId())
                .orElseThrow(() -> new IllegalArgumentException("ScrapYard not found"));

        Container container = containerRepo.findById(dto.getContainerId())
                .orElseThrow(() -> new IllegalArgumentException("Container not found"));

        ManagerSY manager = managerSYRepo.findById(dto.getManagerId())
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (!container.getScrapYard().getId().equals(scrapYard.getId())) {
            throw new IllegalArgumentException("Container does not belong to this ScrapYard");
        }

        if (!manager.getScrapYard().getId().equals(scrapYard.getId())) {
            throw new IllegalArgumentException("Manager must belong to the yard");
        }

        if (!container.getMaterialType().equals(dto.getMaterialType())) {
            throw new IllegalArgumentException(
                    "Material type mismatch: container has "
                            + container.getMaterialType()
                            + " but movement has "
                            + dto.getMaterialType()
            );
        }

        BigDecimal amountInLbs = dto.getUnitOfMeasure().toPounds(dto.getAmountMoved());

        if (dto.getMovementType() == MovementType.OUTBOUND) {
            BigDecimal currentWeight = container.getMaterialWeight() != null ? container.getMaterialWeight() : BigDecimal.ZERO;
            if (currentWeight.compareTo(amountInLbs) < 0) {
                throw new IllegalArgumentException(
                        "Insufficient stock: container has " + currentWeight + " lbs but trying to remove " + amountInLbs + " lbs"
                );
            }
            container.setMaterialWeight(currentWeight.subtract(amountInLbs));
        }

        if (dto.getMovementType() == MovementType.INBOUND) {
            BigDecimal currentWeight = container.getMaterialWeight() != null ? container.getMaterialWeight() : BigDecimal.ZERO;
            container.setMaterialWeight(currentWeight.add(amountInLbs));
        }

        containerRepo.save(container);

        Movement movement = new Movement();
        movement.setScrapYard(scrapYard);
        movement.setContainer(container);
        movement.setDestination(dto.getDestination());
        movement.setAmountMoved(dto.getAmountMoved());
        movement.setUnitOfMeasure(dto.getUnitOfMeasure());
        movement.setMaterialType(dto.getMaterialType());
        movement.setManagerSY(manager);
        movement.setMovementType(dto.getMovementType());

        Movement saved = movementRepo.save(movement);

        return new MovementDTOResponse(
                saved.getId(),
                scrapYard.getName(),
                container.getId(),
                container.getDescription(),
                saved.getMaterialType(),
                saved.getDestination(),
                saved.getAmountMoved(),
                saved.getUnitOfMeasure(),
                amountInLbs,
                saved.getMovementDate(),
                manager.getName(),
                saved.getMovementType()
        );
    }

    @Override
    public List<MovementDTOResponse> getAllMovements() {
        Long yardId = securityContextService.getCurrentYardId();
        List<Movement> movements;

        if (yardId != null) {
            movements = movementRepo.findByScrapYardId(yardId);
        } else {
            movements = movementRepo.findAll();
        }

        if (movements.isEmpty()) {
            throw new IllegalArgumentException("No movements are registered");
        }
        return movements.stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public MovementDTOResponse getMovementById(Long id) {
        Long yardId = securityContextService.getCurrentYardId();

        Movement movement = movementRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movement not found with ID: " + id));

        if (yardId != null && !movement.getScrapYard().getId().equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this movement");
        }

        return mapToDTO(movement);
    }

    @Override
    public List<MovementDTOResponse> getMovementsByScrapYard(Long yardId) {
        Long currentYardId = securityContextService.getCurrentYardId();
        if (currentYardId != null && !currentYardId.equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

        ScrapYard scrapYard = scrapYardRepo.findById(yardId)
                .orElseThrow(() -> new IllegalArgumentException("ScrapYard not found"));

        List<Movement> movements = movementRepo.findByScrapYardId(yardId);
        if (movements.isEmpty()) {
            throw new IllegalArgumentException("No movements found for this ScrapYard");
        }
        return movements.stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<MovementDTOResponse> getMovementsByContainer(Long containerId) {
        Long yardId = securityContextService.getCurrentYardId();

        Container container = containerRepo.findById(containerId)
                .orElseThrow(() -> new IllegalArgumentException("Container not found"));

        if (yardId != null && !container.getScrapYard().getId().equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this container");
        }

        List<Movement> movements = movementRepo.findByContainerId(containerId);
        if (movements.isEmpty()) {
            throw new IllegalArgumentException("No movements found for this Container");
        }
        return movements.stream()
                .map(this::mapToDTO)
                .toList();
    }

    private MovementDTOResponse mapToDTO(Movement movement) {
        BigDecimal amountInLbs = movement.getUnitOfMeasure().toPounds(movement.getAmountMoved());
        return new MovementDTOResponse(
                movement.getId(),
                movement.getScrapYard().getName(),
                movement.getContainer().getId(),
                movement.getContainer().getDescription(),
                movement.getMaterialType(),
                movement.getDestination(),
                movement.getAmountMoved(),
                movement.getUnitOfMeasure(),
                amountInLbs,
                movement.getMovementDate(),
                movement.getManagerSY().getName(),
                movement.getMovementType()
        );
    }
}
