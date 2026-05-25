package com.scrapyard.management.DTO.Response.AuthDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserListResponse {

    private Long id;
    private String email;
    private String role;
    private boolean active;
    private boolean mustChangePassword;
    private String managerName;
    private Long managerId;
    private String phone;
    private Long yardId;
    private LocalDateTime createdAt;
}
