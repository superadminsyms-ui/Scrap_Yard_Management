package com.scrapyard.management.DTO.Response.AuthDTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse {

    private String token;
    private Long userId;
    private String email;
    private String role;
    private Long yardId;
    private String managerName;
    private boolean mustChangePassword;
    private boolean requires2FA;
    private String tempToken;
    private boolean twoFactorEnabled;
}
