package com.scrapyard.management.Controllers;

import com.scrapyard.management.DTO.Request.AuthDTO.ForgotPasswordRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.ResetPasswordRequest;
import com.scrapyard.management.DTO.Response.AuthDTO.ForgotPasswordResponse;
import com.scrapyard.management.DTO.Response.AuthDTO.ResetPasswordResponse;
import com.scrapyard.management.Services.IPasswordRecoveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordRecoveryController {

    private final IPasswordRecoveryService passwordRecoveryService;

    @Autowired
    public PasswordRecoveryController(IPasswordRecoveryService passwordRecoveryService) {
        this.passwordRecoveryService = passwordRecoveryService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = passwordRecoveryService.requestReset(request.getEmail());
        return ResponseEntity.ok(new ForgotPasswordResponse(message));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            String message = passwordRecoveryService.resetPassword(
                    request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(new ResetPasswordResponse(message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }
}
