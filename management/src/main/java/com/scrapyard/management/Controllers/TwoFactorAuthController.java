package com.scrapyard.management.Controllers;

import com.scrapyard.management.DTO.Request.AuthDTO.Activate2FARequest;
import com.scrapyard.management.DTO.Request.AuthDTO.Disable2FARequest;
import com.scrapyard.management.DTO.Request.AuthDTO.Verify2FARequest;
import com.scrapyard.management.DTO.Response.AuthDTO.LoginResponse;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IAuthService;
import com.scrapyard.management.Services.ITwoFactorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/2fa")
public class TwoFactorAuthController {

    private final ITwoFactorService twoFactorService;
    private final IAuthService authService;
    private final SecurityContextService securityContextService;

    public TwoFactorAuthController(
            ITwoFactorService twoFactorService,
            IAuthService authService,
            SecurityContextService securityContextService
    ) {
        this.twoFactorService = twoFactorService;
        this.authService = authService;
        this.securityContextService = securityContextService;
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@Valid @RequestBody Verify2FARequest request) {
        try {
            LoginResponse response = authService.complete2FALogin(request.getTempToken(), request.getCode());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/setup")
    public ResponseEntity<?> setup() {
        try {
            return ResponseEntity.ok(
                    twoFactorService.setup(securityContextService.getCurrentUser())
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PostMapping("/activate")
    public ResponseEntity<?> activate(@Valid @RequestBody Activate2FARequest request) {
        try {
            twoFactorService.enable(securityContextService.getCurrentUser(), request.getCode());
            return ResponseEntity.ok(Map.of("message", "Two-factor authentication enabled successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PostMapping("/disable")
    public ResponseEntity<?> disable(@Valid @RequestBody Disable2FARequest request) {
        try {
            twoFactorService.disable(
                    securityContextService.getCurrentUser(),
                    request.getCurrentPassword(),
                    request.getCode()
            );
            return ResponseEntity.ok(Map.of("message", "Two-factor authentication disabled"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(
                twoFactorService.getStatus(securityContextService.getCurrentUser())
        );
    }
}
