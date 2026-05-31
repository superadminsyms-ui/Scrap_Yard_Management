package com.scrapyard.management.DTO.Request.AuthDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Verify2FARequest {

    @NotBlank(message = "Temporary token is required")
    private String tempToken;

    @NotBlank(message = "Verification code is required")
    @Size(min = 6, max = 6, message = "Code must be 6 digits")
    @Pattern(regexp = "\\d{6}", message = "Code must be 6 digits")
    private String code;
}
