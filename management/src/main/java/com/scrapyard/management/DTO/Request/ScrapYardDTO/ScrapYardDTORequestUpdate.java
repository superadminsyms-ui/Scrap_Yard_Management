package com.scrapyard.management.DTO.Request.ScrapYardDTO;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ScrapYardDTORequestUpdate {

    @Size(max = 100, message = "Name must be at most 100 characters")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "Only letters are allowed")
    private String name;

    @Size(min = 5, max = 255, message = "Location must be between 5 and 255 characters")
    @Pattern(regexp = "^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])(?=.*[0-9])[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ,.\\-]+$"
            , message = "Location must contain both letters and numbers")
    private String location;


    private Boolean active;

}
