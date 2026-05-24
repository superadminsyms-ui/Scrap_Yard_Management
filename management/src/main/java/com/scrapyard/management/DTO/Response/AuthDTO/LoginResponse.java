package com.scrapyard.management.DTO.Response.AuthDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    private String token;
    private Long userId;
    private String email;
    private String role;
    private Long yardId;
    private String managerName;
    private boolean mustChangePassword;
}
