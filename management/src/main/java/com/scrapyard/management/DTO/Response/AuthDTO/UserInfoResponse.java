package com.scrapyard.management.DTO.Response.AuthDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponse {

    private Long id;
    private String email;
    private String role;
    private Long yardId;
    private String managerName;
    private boolean mustChangePassword;
    private boolean active;
}
