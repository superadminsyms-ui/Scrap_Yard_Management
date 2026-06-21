package com.scrapyard.management.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WipeRestoreRequest {

    @NotBlank(message = "Confirmation word is required")
    private String confirmation;

    @NotBlank(message = "Password is required")
    @Size(max = 72, message = "Password must be at most 72 characters")
    private String password;

    @Size(min = 6, max = 6, message = "2FA code must be 6 digits")
    @Pattern(regexp = "\\d{6}", message = "2FA code must be 6 digits")
    private String twoFACode;
}
