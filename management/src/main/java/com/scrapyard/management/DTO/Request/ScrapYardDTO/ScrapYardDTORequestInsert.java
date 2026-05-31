package com.scrapyard.management.DTO.Request.ScrapYardDTO;
import com.scrapyard.management.Models.Company;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ScrapYardDTORequestInsert {


    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]+$", message = "Name must contain only letters")
    private String name;

    @NotBlank(message = "Location is required")
    @Size(min = 5, max = 255, message = "Location must be between 5 and 255 characters")
    @Pattern(regexp = "^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])(?=.*[0-9])[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ,.\\-]+$"
                        , message = "Location must contain both letters and numbers")
    private String location;

    private boolean active = true;

    @NotNull(message = "CompanyId is required")
    @Positive(message = "CompanyId must be a positive number")
    private Long companyId;

}
