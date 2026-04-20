package com.scrapyard.management.DTO.Response.CompanyDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CompanyDTOResponse {

    private Long id;
    private String name;
    private String location;

}
