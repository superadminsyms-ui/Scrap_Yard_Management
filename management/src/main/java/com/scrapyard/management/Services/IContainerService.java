package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTOgetAllCont;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequest;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequestUpdate;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDToGetContainers;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.ScrapYard;

import java.math.BigDecimal;
import java.util.List;


public interface IContainerService {

    List<ContainerDTOResponse> getAllContainers();
    ContainerDTOResponse getContainerById(Long id);
    List<ContainerDTOResponse> getContainersByMaterial(MaterialType material);
    ContainerDTOResponse saveContainer(ContainerDTORequest container);
    ContainerDTOResponse updateContainer(ContainerDTORequestUpdate container, Long id);
    String deleteContainer(Long id);
    List<ContainerDTOResponse> getContainersByScrapYard(ScrapYardDToGetContainers yard);
    List<ContainerDTOResponse> getContainersByCompany(CompanyDTOgetAllCont company);
    BigDecimal getMaterialWeight(ContainerDTORequest container, Long id);



}
