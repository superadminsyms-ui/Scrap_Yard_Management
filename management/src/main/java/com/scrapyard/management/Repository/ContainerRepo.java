package com.scrapyard.management.Repository;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.Models.Container;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;


public interface ContainerRepo extends JpaRepository<Container,Long> {

    @Query("""
    SELECT new com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse(
        c.id,
        c.description,
        c.materialType,
        c.containerSize,
        c.materialWeight,
        'POUNDS'
    )
    FROM Container c
    WHERE c.scrapYard.company.name = :companyName
""")
    List<ContainerDTOResponse> findContainersByCompanyName(String companyName);

    @Query("""
    SELECT new com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse(
        c.id,
        c.description,
        c.materialType,
        c.containerSize,
        c.materialWeight,
        'POUNDS'
    )
    FROM Container c
    WHERE c.scrapYard.company.id = :companyId
""")
    List<ContainerDTOResponse> findContainersByCompanyId(Long companyId);

    @Query("""
    SELECT new com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse(
        c.id,
        c.description,
        c.materialType,
        c.containerSize,
        c.materialWeight,
        'POUNDS'
    )
    FROM Container c
    WHERE c.scrapYard.company.id = :companyId AND c.scrapYard.id = :yardId
""")
    List<ContainerDTOResponse> findContainersByCompanyIdAndScrapYardId(Long companyId, Long yardId);

    Optional<Container> findByIdAndScrapYardId(Long containerId, Long yardId);
}
