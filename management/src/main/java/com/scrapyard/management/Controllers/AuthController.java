package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.AuthDTO.ChangePasswordRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.LoginRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.RegisterRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.UpdateProfileRequest;
import com.scrapyard.management.SecurityConfig.JwtUtil;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IAuthService;
import com.scrapyard.management.Services.ITokenRevocationService;
import com.scrapyard.management.Services.Impl.AuthServImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private final IAuthService authService;

    @Autowired
    private final SecurityContextService securityContextService;

    @Autowired
    private final JwtUtil jwtUtil;

    @Autowired
    private final ITokenRevocationService tokenRevocationService;

    public AuthController(AuthServImpl authService, SecurityContextService securityContextService,
                          JwtUtil jwtUtil, ITokenRevocationService tokenRevocationService) {
        this.authService = authService;
        this.securityContextService = securityContextService;
        this.jwtUtil = jwtUtil;
        this.tokenRevocationService = tokenRevocationService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String jti = jwtUtil.extractJti(token);
                String userEmail = securityContextService.getCurrentUser() != null
                        ? securityContextService.getCurrentUser().getEmail()
                        : "unknown";
                tokenRevocationService.revoke(
                        jti,
                        userEmail,
                        jwtUtil.extractExpiration(token).toInstant()
                                .atZone(ZoneId.systemDefault())
                                .toLocalDateTime()
                );
            }
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request, securityContextService.getCurrentUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        try {
            return ResponseEntity.ok(authService.getCurrentUserInfo(securityContextService.getCurrentUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            authService.changePassword(request, securityContextService.getCurrentUser());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            return ResponseEntity.ok(authService.updateProfile(request, securityContextService.getCurrentUser()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }
}
