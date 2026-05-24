package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequest;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequestUpdate;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDToGetContainers;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Services.IContainerService;
import com.scrapyard.management.Services.Impl.ContainerServImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/container")
public class ContainerController {

    @Autowired
    private final IContainerService containerServices;

    public ContainerController(ContainerServImpl containerServices) {
        this.containerServices = containerServices;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllContainers() {
        try {
            return ResponseEntity.ok(containerServices.getAllContainers());
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
            @RequestParam MaterialType material) {
        try {
            return ResponseEntity.ok(containerServices.getContainersByMaterial(material));
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


    @GetMapping("/all-by-yard")
    public ResponseEntity<?> getContainersByScrapYard( ScrapYardDToGetContainers yard) {
        try {
            return ResponseEntity.ok(containerServices.getContainersByScrapYard(yard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }

    }

    @GetMapping("/company/{companyId}/containers")
    public ResponseEntity<?> getContainersByCompany(@PathVariable Long companyId) {
        try {
            return ResponseEntity.ok(containerServices.getContainersByCompany(companyId));
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
