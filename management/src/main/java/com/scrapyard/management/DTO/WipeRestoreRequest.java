package com.scrapyard.management.DTO;

import jakarta.validation.constraints.NotBlank;
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
    private String password;
}
