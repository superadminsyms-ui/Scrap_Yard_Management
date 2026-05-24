package com.scrapyard.management.DTO.Response.AuthDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponse {

    private Long id;
    private String email;
    private String role;
    private String managerName;
    private Long yardId;
}
