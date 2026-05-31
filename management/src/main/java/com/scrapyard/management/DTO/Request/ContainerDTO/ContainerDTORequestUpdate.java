package com.scrapyard.management.DTO.Request.ContainerDTO;
import com.scrapyard.management.Models.Enums.MaterialType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class ContainerDTORequestUpdate {


    @Size(max = 200, message = "Description must be at most 200 characters")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "Only letters are allowed")
    private String description;

    private MaterialType materialType;

}
