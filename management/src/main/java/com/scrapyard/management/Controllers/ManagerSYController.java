package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.ManagerSYDTO.ManagerSYDTORequestInsert;
import com.scrapyard.management.Services.IManagerSYService;
import com.scrapyard.management.Services.Impl.ManagerSYServImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/manager")
public class ManagerSYController {

    @Autowired
    private final IManagerSYService managerSYServ;

    public ManagerSYController(ManagerSYServImpl managerSYServ) {
        this.managerSYServ = managerSYServ;
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAllManagers() {
        try {
            return ResponseEntity.ok(managerSYServ.getAllManagers());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/id/{id}")
    public ResponseEntity<?> getManagerById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(managerSYServ.getManagerSYById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/search")
    public ResponseEntity<?> getManagerByName(@RequestParam String name) {
        try {
            return ResponseEntity.ok(managerSYServ.getManagerSYByName(name));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveManager( @Valid @RequestBody ManagerSYDTORequestInsert managerDTOInsert) {
        try {
            return ResponseEntity.ok(managerSYServ.saveManagerSY(managerDTOInsert));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateManager(
            @PathVariable Long id,
           @Valid @RequestBody ManagerSYDTORequestInsert manager) {
        try {
            return ResponseEntity.ok(managerSYServ.updateManager(manager, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(managerSYServ.deleteManager(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/yard/{id}/all-managers")
    public ResponseEntity<?> getAllManagersByScrapYard(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(managerSYServ.getAllManagersByScrapYard(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }





}
