package com.scrapyard.management.Repository;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.Models.Container;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;


public interface ContainerRepo extends JpaRepository<Container,Long> {

    @Query("""
    SELECT new com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse(
        c.description,
        c.materialType,
        c.containerSize,
        c.materialWeight
    )
    FROM Container c
    WHERE c.scrapYard.company.name = :companyName
""")
    List<ContainerDTOResponse> findContainersByCompanyName(String companyName);






}
