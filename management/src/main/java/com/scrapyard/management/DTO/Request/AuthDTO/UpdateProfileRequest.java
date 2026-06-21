package com.scrapyard.management.DTO.Request.AuthDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be at most 100 characters")
    private String email;

    @NotBlank(message = "Current password is required")
    @Size(max = 72, message = "Current password must be at most 72 characters")
    private String currentPassword;

    @Size(min = 6, max = 72, message = "New password must be between 6 and 72 characters")
    private String newPassword;
}
