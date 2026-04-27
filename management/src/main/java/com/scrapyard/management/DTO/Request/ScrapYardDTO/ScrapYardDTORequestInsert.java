package com.scrapyard.management.DTO.Request.ScrapYardDTO;
import com.scrapyard.management.Models.Company;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ScrapYardDTORequestInsert {

    private String name;
    private String location;
    private boolean active = true;
    private Long companyId;

}
