package com.scrapyard.management.Controllers;
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














}
