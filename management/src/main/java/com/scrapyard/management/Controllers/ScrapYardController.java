package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequestUpdate;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.Services.Impl.ScrapYardServImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/scrapyard")
public class ScrapYardController {

    @Autowired
    private final ScrapYardServImpl scrapYardServImpl;

    public ScrapYardController(ScrapYardServImpl scrapYardServImpl) {this.scrapYardServImpl = scrapYardServImpl;}

    @PostMapping("/save")
    public ResponseEntity<?> saveScrapYard(@RequestBody ScrapYardDTORequestInsert scrapYard ) {
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
    public String delete(@PathVariable Long id) {
        return scrapYardServImpl.deleteScrapYard(id);
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

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody ScrapYardDTORequestInsert yard) {
        try {
            return ResponseEntity.ok((scrapYardServImpl.updateScrapYard(yard, id)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }










}