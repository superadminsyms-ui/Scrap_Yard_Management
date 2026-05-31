package com.scrapyard.management.DTO.Response.AuthDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Setup2FAResponse {

    private String secret;
    private String qrCodeUrl;
}
