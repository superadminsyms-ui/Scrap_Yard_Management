package com.scrapyard.management.DTO.Request.AuthDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {

    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String newPassword;
}
