package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequestUpdate;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestUpdate;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerStockResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardStockTotalResponse;
import com.scrapyard.management.Services.IScrapYardService;
import com.scrapyard.management.Services.Impl.ScrapYardServImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/scrapyard")
public class ScrapYardController {

    @Autowired
    private final IScrapYardService scrapYardServImpl;

    public ScrapYardController(ScrapYardServImpl scrapYardServImpl) {this.scrapYardServImpl = scrapYardServImpl;}

    @PostMapping("/save")
    public ResponseEntity<?> saveScrapYard(@Valid @RequestBody ScrapYardDTORequestInsert scrapYard ) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.saveScrapYard(scrapYard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllScrapYards() {
        try {
            return ResponseEntity.ok(scrapYardServImpl.getAllScrapYard());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getScrapYardById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.getScrapYardById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> getScrapYardByName(@RequestParam String name) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.getScrapYardByName(name));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.deleteScrapYard(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/all-yards-by-company/{companyID}")
    public ResponseEntity<?> getAllYardsByCompany(@PathVariable Long companyID) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.getAllYardByCompany(companyID));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/{yardId}/all-containers")
    public ResponseEntity<?> getContainers(@PathVariable Long yardId) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.getContainers(yardId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody ScrapYardDTORequestUpdate yard) {
        try {
            return ResponseEntity.ok((scrapYardServImpl.updateScrapYard(yard, id)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/{yardId}/stock")
    public ResponseEntity<?> getTotalStock(@PathVariable Long yardId) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.getTotalStockByYardId(yardId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/{yardId}/stock/containers")
    public ResponseEntity<?> getStockByContainers(@PathVariable Long yardId) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.getStockByContainers(yardId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/{yardId}/stock/containers/{containerId}")
    public ResponseEntity<?> getStockByContainer(@PathVariable Long yardId, @PathVariable Long containerId) {
        try {
            return ResponseEntity.ok(scrapYardServImpl.getStockByContainerId(yardId, containerId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }
}
