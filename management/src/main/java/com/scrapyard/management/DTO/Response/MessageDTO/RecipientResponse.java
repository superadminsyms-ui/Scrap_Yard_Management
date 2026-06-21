package com.scrapyard.management.DTO.Response.MessageDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RecipientResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String yardName;
}
