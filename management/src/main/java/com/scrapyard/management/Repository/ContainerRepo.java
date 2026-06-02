package com.scrapyard.management.Repository;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.Enums.MaterialType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    Page<Container> findByMaterialType(MaterialType materialType, Pageable pageable);

    Page<Container> findByScrapYardId(Long scrapYardId, Pageable pageable);

    Page<Container> findByScrapYard_Company_Id(Long companyId, Pageable pageable);

    Page<Container> findByScrapYard_Company_IdAndScrapYard_Id(Long companyId, Long yardId, Pageable pageable);

    long countByScrapYardId(Long scrapYardId);

    Optional<Container> findByIdAndScrapYardId(Long containerId, Long yardId);
}
