package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequest;
import com.scrapyard.management.DTO.Request.ContainerDTO.ContainerDTORequestUpdate;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.UnitOfMeasure;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Repository.CompanyRepo;
import com.scrapyard.management.Repository.ContainerRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IContainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ContainerServImpl implements IContainerService {

    @Autowired
    private final ContainerRepo containerRepo;
    @Autowired
    private final  ScrapYardRepo scrapYardRepo;
    @Autowired
    private final CompanyRepo companyRepo;

    @Autowired
    private final SecurityContextService securityContextService;

    public ContainerServImpl(ContainerRepo containerRepo, ScrapYardRepo scrapYardRepo, CompanyRepo companyRepo, SecurityContextService securityContextService) {
        this.containerRepo = containerRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.companyRepo = companyRepo;
        this.securityContextService = securityContextService;
    }

    @Override
    public Page<ContainerDTOResponse> getAllContainers(Pageable pageable) {
        Long yardId = securityContextService.getCurrentYardId();
        Page<Container> containers;

        if (yardId != null) {
            containers = containerRepo.findByScrapYardId(yardId, pageable);
        } else {
            containers = containerRepo.findAll(pageable);
        }

        if (containers.isEmpty()) {
            throw new IllegalArgumentException("There are no registered containers");
        }

        return containers.map(cont ->
                new ContainerDTOResponse(cont.getId(), cont.getDescription(), cont.getMaterialType(),
                        cont.getContainerSize(), cont.getMaterialWeight(), "POUNDS"));
    }


    @Override
    public ContainerDTOResponse getContainerById(Long id) {
        Long yardId = securityContextService.getCurrentYardId();

        if (!containerRepo.existsById(id)) {
            throw new IllegalArgumentException("There is no container ID: " + " " + id);
        }
        Container container = containerRepo.findById(id).get();

        if (yardId != null && !container.getScrapYard().getId().equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this container");
        }

        return new ContainerDTOResponse(container.getId(),container.getDescription(),
                container.getMaterialType(),container.getContainerSize(),
                container.getMaterialWeight(), "POUNDS");
    }


    @Override
    public Page<ContainerDTOResponse> getContainersByMaterial(MaterialType material, Pageable pageable) {
        Page<Container> containers = containerRepo.findByMaterialType(material, pageable);
        if (containers.isEmpty()) {
            throw new IllegalArgumentException("No containers found for material: " + material);
        }
        return containers.map(cont ->
                new ContainerDTOResponse(cont.getId(), cont.getDescription(), cont.getMaterialType(),
                        cont.getContainerSize(), cont.getMaterialWeight(), "POUNDS"));
    }


    @Override
    public ContainerDTOResponse saveContainer(ContainerDTORequest container) {
        Long yardId = securityContextService.getCurrentYardId();
        if (yardId != null) {
            container.setScrapYardId(yardId);
        }

        Container containerEntity = new Container();

        containerEntity.setDescription(container.getDescription());
        BigDecimal weightInLbs = container.getUnitOfMeasure().toPounds(container.getMaterialWeight());
        containerEntity.setMaterialWeight(weightInLbs);
        containerEntity.setContainerSize(container.getContainerSize());
        containerEntity.setMaterialType(container.getMaterialType());

        ScrapYard scrapYard = scrapYardRepo.findById(container.getScrapYardId())
                .orElseThrow(() -> new IllegalArgumentException("ScrapYard not found"));
        containerEntity.setScrapYard(scrapYard);

        Container savedContainer = containerRepo.save(containerEntity);

        return new ContainerDTOResponse(
                savedContainer.getId(),
                savedContainer.getDescription(),
                savedContainer.getMaterialType(),
                savedContainer.getContainerSize(),
                savedContainer.getMaterialWeight(),
                "POUNDS");
    }


    @Override
    public ContainerDTOResponse updateContainer(ContainerDTORequestUpdate cont, Long id) {
        Long yardId = securityContextService.getCurrentYardId();

        Container existing = containerRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The container does not exist"));

        if (yardId != null && !existing.getScrapYard().getId().equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this container");
        }

        if (cont.getDescription().isBlank()) {
            throw new IllegalArgumentException("There cannot be blank fields");
        }

        if (cont.getMaterialType() != null
                && !cont.getMaterialType().equals(existing.getMaterialType())
                && existing.getMaterialWeight() != null
                && existing.getMaterialWeight().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("Cannot change material type: container already has material assigned");
        }

        existing.setDescription(cont.getDescription());

        if (cont.getMaterialType() != null) {
            existing.setMaterialType(cont.getMaterialType());
        }

        Container updatedContainer = containerRepo.save(existing);

        return new ContainerDTOResponse
                (updatedContainer.getId(),updatedContainer.getDescription(), updatedContainer.getMaterialType(),
                updatedContainer.getContainerSize(), updatedContainer.getMaterialWeight(), "POUNDS");
    }


    @Override
    public String deleteContainer(Long id) {
        Long yardId = securityContextService.getCurrentYardId();

        Container container = containerRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The container does not exist"));

        if (yardId != null && !container.getScrapYard().getId().equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this container");
        }

        if (!container.getInvoiceDetails().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete container with associated invoice details");
        }

        containerRepo.deleteById(id);
        return "Container successfully removed";
    }

    @Override
    public Page<ContainerDTOResponse> getContainersByScrapYard(Long yardId, Pageable pageable) {
        ScrapYard existing = scrapYardRepo.findById(yardId)
                .orElseThrow(() -> new IllegalArgumentException("The scrapyard does not exist, please try again"));

        Page<Container> containers = containerRepo.findByScrapYardId(yardId, pageable);
        if (containers.isEmpty()) {
            throw new IllegalArgumentException("No containers found for this ScrapYard");
        }
        return containers.map(cont ->
                new ContainerDTOResponse(cont.getId(), cont.getDescription(), cont.getMaterialType(),
                        cont.getContainerSize(), cont.getMaterialWeight(), "POUNDS"));
    }


    @Override
    public Page<ContainerDTOResponse> getContainersByCompany(Long companyId, Pageable pageable) {
        if (companyId == null || companyId <= 0) {
            throw new IllegalArgumentException("Company ID cannot be null or negative");
        }
        if (!companyRepo.existsById(companyId)) {
            throw new IllegalArgumentException("The company does not exist");
        }
        Long yardId = securityContextService.getCurrentYardId();
        Page<Container> containers;
        if (yardId != null) {
            containers = containerRepo.findByScrapYard_Company_IdAndScrapYard_Id(companyId, yardId, pageable);
        } else {
            containers = containerRepo.findByScrapYard_Company_Id(companyId, pageable);
        }
        if (containers.isEmpty()) {
            throw new IllegalArgumentException("No containers found for this company");
        }
        return containers.map(cont ->
                new ContainerDTOResponse(cont.getId(), cont.getDescription(), cont.getMaterialType(),
                        cont.getContainerSize(), cont.getMaterialWeight(), "POUNDS"));
    }


    @Override
    public BigDecimal getMaterialWeight(ContainerDTORequest container, Long id) {

        if (container == null || container.getContainerSize() == null || container.getMaterialType() == null) {
            throw new IllegalArgumentException("Container cannot be blank or null");
        }

        if (getContainerById(id)==null) {
            throw new IllegalArgumentException("The container does not exist");
        }

        return getContainerById(id).getMaterialWeight();
    }






}
