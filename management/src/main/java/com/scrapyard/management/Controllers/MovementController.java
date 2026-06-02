package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.MovementDTO.MovementDTORequestInsert;
import com.scrapyard.management.Services.IMovementService;
import com.scrapyard.management.Services.Impl.MovementServImpl;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/movement")
public class MovementController {

    private final IMovementService movementServImpl;

    public MovementController(MovementServImpl movementServImpl) {
        this.movementServImpl = movementServImpl;
    }

    @PostMapping("/save")
    public ResponseEntity<?> createMovement(@Valid @RequestBody MovementDTORequestInsert dto) {
        try {
            return ResponseEntity.ok(movementServImpl.createMovement(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "movementDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Sort sort = direction.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            return ResponseEntity.ok(movementServImpl.getAllMovements(pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getMovementById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(movementServImpl.getMovementById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/yard/{yardId}")
    public ResponseEntity<?> getMovementsByScrapYard(
            @PathVariable Long yardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "movementDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Sort sort = direction.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            return ResponseEntity.ok(movementServImpl.getMovementsByScrapYard(yardId, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/container/{containerId}")
    public ResponseEntity<?> getMovementsByContainer(
            @PathVariable Long containerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "movementDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Sort sort = direction.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            return ResponseEntity.ok(movementServImpl.getMovementsByContainer(containerId, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }
}
