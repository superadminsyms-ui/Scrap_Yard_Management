package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequest;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequestUpdate;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Services.IContainerService;
import com.scrapyard.management.Services.Impl.ContainerServImpl;
import com.scrapyard.management.Util.PageableUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Set;


@RestController
@RequestMapping("/api/container")
public class ContainerController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "createdAt", "materialWeight", "description");

    @Autowired
    private final IContainerService containerServices;

    public ContainerController(ContainerServImpl containerServices) {
        this.containerServices = containerServices;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllContainers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(containerServices.getAllContainers(pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/id/{id}")
    public ResponseEntity<?> getContainerById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(containerServices.getContainerById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/by-material")
    public ResponseEntity<?> getByMaterial(
            @RequestParam MaterialType material,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(containerServices.getContainersByMaterial(material, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }

    }

    @PostMapping("/save")
    public ResponseEntity<?> saveContainer(@Valid @RequestBody ContainerDTORequest container) {
        try {
            return ResponseEntity.ok(containerServices.saveContainer(container));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
           @Valid @RequestBody ContainerDTORequestUpdate container) {
        try {
            return ResponseEntity.ok(containerServices.updateContainer(container, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(containerServices.deleteContainer(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/by-yard")
    public ResponseEntity<?> getContainersByScrapYard(
            @RequestParam Long yardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(containerServices.getContainersByScrapYard(yardId, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }

    }

    @GetMapping("/company/{companyId}/containers")
    public ResponseEntity<?> getContainersByCompany(
            @PathVariable Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(containerServices.getContainersByCompany(companyId, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }

    }


    @GetMapping("/weight/{id}")
    public ResponseEntity<?> getMaterialWeight(
            @PathVariable Long id,
           @Valid @RequestBody ContainerDTORequest container) {
        try {
            return ResponseEntity.ok(containerServices.getMaterialWeight(container, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


}
