package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequest;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequestUpdate;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDToGetContainers;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.ScrapYard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;


public interface IContainerService {

    Page<ContainerDTOResponse> getAllContainers(Pageable pageable);
    ContainerDTOResponse getContainerById(Long id);
    Page<ContainerDTOResponse> getContainersByMaterial(MaterialType material, Pageable pageable);
    ContainerDTOResponse saveContainer(ContainerDTORequest container);
    ContainerDTOResponse updateContainer(ContainerDTORequestUpdate container, Long id);
    String deleteContainer(Long id);
    Page<ContainerDTOResponse> getContainersByScrapYard(Long yardId, Pageable pageable);
    Page<ContainerDTOResponse> getContainersByCompany(Long companyId, Pageable pageable);
    BigDecimal getMaterialWeight(ContainerDTORequest container, Long id);



}
