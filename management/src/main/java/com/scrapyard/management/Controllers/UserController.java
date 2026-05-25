package com.scrapyard.management.Controllers;

import com.scrapyard.management.DTO.Request.AuthDTO.UserUpdateRequest;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.Impl.UserServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private final UserServiceImpl userService;

    @Autowired
    private final SecurityContextService securityContextService;

    public UserController(UserServiceImpl userService, SecurityContextService securityContextService) {
        this.userService = userService;
        this.securityContextService = securityContextService;
    }

    @GetMapping
    public ResponseEntity<?> listAll() {
        try {
            return ResponseEntity.ok(userService.listAll(securityContextService.getCurrentUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getById(id, securityContextService.getCurrentUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @Valid @RequestBody UserUpdateRequest request) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, request, securityContextService.getCurrentUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.activateUser(id, securityContextService.getCurrentUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.deactivateUser(id, securityContextService.getCurrentUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }
}
