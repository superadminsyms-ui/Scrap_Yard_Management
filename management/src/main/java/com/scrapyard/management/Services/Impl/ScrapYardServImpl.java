package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestUpdate;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerStockResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.MaterialStock;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardDTOResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardStockTotalResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.dtoResponseId;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Repository.CompanyRepo;
import com.scrapyard.management.Repository.ContainerRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.Services.IScrapYardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class ScrapYardServImpl implements IScrapYardService {


    @Autowired
    private final ScrapYardRepo scrapYardRepo;
    @Autowired
    private final CompanyRepo companyRepo;
    @Autowired
    private final CompanyServImpl companyServImpl;
    @Autowired
    private final ContainerRepo containerRepo;

    public ScrapYardServImpl(ScrapYardRepo scrapYardRepo, CompanyRepo companyRepo, CompanyServImpl companyServImpl, ContainerRepo containerRepo) {
        this.scrapYardRepo = scrapYardRepo;
        this.companyRepo = companyRepo;
        this.companyServImpl = companyServImpl;
        this.containerRepo = containerRepo;
    }


    @Override
    public List<dtoResponseId> getAllScrapYard() {

        if (scrapYardRepo.findAll().isEmpty()) {
            throw new IllegalArgumentException("There are no registered ScrapYards");
        }

        return scrapYardRepo.findAll().stream().map
                (yard -> new dtoResponseId
                        (yard.getId(), yard.getCompany().getName(), yard.getName(), yard.getLocation(), yard.isActive())).toList();
    }

    @Override
    public ScrapYardDTOResponse getScrapYardById(Long id) {

        if (!scrapYardRepo.existsById(id)) {
            throw new IllegalArgumentException("There is no scrapyard ID: " + " " + id);
        }

        Optional<ScrapYard> yard= scrapYardRepo.findById(id);

        return new ScrapYardDTOResponse(yard.get().getCompany().getName(),yard.get().getName(),
                yard.get().getLocation(),yard.get().isActive());
    }


    @Override
    public List<ScrapYardDTOResponse> getScrapYardByName(String name) {

        if(name==null || name.isEmpty()) throw new
                IllegalArgumentException("ScrapYard name cannot be empty or null");

        List<ScrapYard> found= scrapYardRepo.findByNameContainingIgnoreCase(name);

        if (found.isEmpty()) throw new IllegalArgumentException("There are no registered ScrapYards");

        return found.stream().map(yard -> new ScrapYardDTOResponse(yard.getCompany().getName(),
                yard.getName(), yard.getLocation(), yard.isActive())).toList();

    }




    @Override
    public ScrapYardDTOResponse saveScrapYard(ScrapYardDTORequestInsert scrapYardDTO) {

        ScrapYard yardEntity = new ScrapYard();

        Company company = companyRepo.findById(scrapYardDTO.getCompanyId()).
                orElseThrow(() -> new IllegalArgumentException("Company not found with ID: "
                        + scrapYardDTO.getCompanyId()));

        yardEntity.setCompany(company);
        yardEntity.setName(scrapYardDTO.getName());
        yardEntity.setLocation(scrapYardDTO.getLocation());
        yardEntity.setActive(scrapYardDTO.isActive());

        ScrapYard saved= scrapYardRepo.save(yardEntity);

        return new ScrapYardDTOResponse(saved.getCompany().getName(),
                saved.getName(),saved.getLocation(),saved.isActive());
    }

    @Override
    public String deleteScrapYard(Long id) {
        if (scrapYardRepo.existsById(id)) {
            scrapYardRepo.deleteById(id);
            return "ScrapYard successfully removed";
        }else {
            return "ScrapYard does not exist";
        }
    }


    @Override
    public List<ScrapYardDTOResponse> getAllYardByCompany(Long companyID) {

        Company entity = companyRepo.findById(companyID).orElseThrow(() -> new IllegalArgumentException
                ("Company not found with ID: " + companyID));

        return entity.getScrapYards().stream().map(yard -> new ScrapYardDTOResponse(
                yard.getCompany().getName(),yard.getName(),yard.getLocation(), yard.isActive()
        )).toList();
    }



    @Override
    public ScrapYardDTOResponse updateScrapYard(ScrapYardDTORequestUpdate yard, Long id) {

        ScrapYard existing = scrapYardRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The scrapyard does not exist"));

        if (yard.getName().isBlank() || yard.getLocation().isBlank() ) {
            throw new IllegalArgumentException("There cannot be blank fields");
        }

        existing.setName(yard.getName());
        existing.setLocation(yard.getLocation());
        existing.setActive(yard.isActive());

        ScrapYard saved = scrapYardRepo.save(existing);

        return new ScrapYardDTOResponse(saved.getCompany().getName(),
                saved.getName(),saved.getLocation(),saved.isActive());
    }

    @Override
    public List<ContainerDTOResponse> getContainers(Long yardId) {

        ScrapYard existing = scrapYardRepo.findById(yardId).orElseThrow(() ->
                new IllegalArgumentException("The scrapyard does not exist"));

        if (existing.getContainers().isEmpty()) {
            throw new IllegalArgumentException("No containers present in the scrapyard");
        }

        return existing.getContainers().stream().map(container -> new
                ContainerDTOResponse(container.getId(),container.getDescription(), container.getMaterialType()
        ,container.getContainerSize(),container.getMaterialWeight(), "POUNDS")).toList();
    }

    @Override
    public ScrapYardStockTotalResponse getTotalStockByYardId(Long yardId) {
        ScrapYard existing = scrapYardRepo.findById(yardId).orElseThrow(() ->
                new IllegalArgumentException("The scrapyard does not exist"));

        List<Container> containers = existing.getContainers();
        if (containers.isEmpty()) {
            throw new IllegalArgumentException("No containers present in the scrapyard");
        }

        BigDecimal totalWeight = containers.stream()
                .map(c -> c.getMaterialWeight() != null ? c.getMaterialWeight() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<MaterialType, List<Container>> grouped = containers.stream()
                .filter(c -> c.getMaterialType() != null)
                .collect(Collectors.groupingBy(Container::getMaterialType));

        List<MaterialStock> breakdown = grouped.entrySet().stream()
                .map(entry -> new MaterialStock(
                        entry.getKey(),
                        entry.getValue().stream()
                                .map(c -> c.getMaterialWeight() != null ? c.getMaterialWeight() : BigDecimal.ZERO)
                                .reduce(BigDecimal.ZERO, BigDecimal::add),
                        entry.getValue().size(),
                        "POUNDS"
                ))
                .toList();

        return new ScrapYardStockTotalResponse(
                existing.getId(),
                existing.getName(),
                totalWeight,
                containers.size(),
                breakdown,
                "POUNDS"
        );
    }

    @Override
    public List<ContainerStockResponse> getStockByContainers(Long yardId) {
        ScrapYard existing = scrapYardRepo.findById(yardId).orElseThrow(() ->
                new IllegalArgumentException("The scrapyard does not exist"));

        List<Container> containers = existing.getContainers();
        if (containers.isEmpty()) {
            throw new IllegalArgumentException("No containers present in the scrapyard");
        }

        return containers.stream().map(container -> new ContainerStockResponse(
                container.getId(),
                container.getDescription(),
                container.getMaterialType(),
                container.getContainerSize(),
                container.getMaterialWeight(),
                existing.getName(),
                "POUNDS"
        )).toList();
    }

    @Override
    public ContainerStockResponse getStockByContainerId(Long yardId, Long containerId) {
        Container container = containerRepo.findByIdAndScrapYardId(containerId, yardId)
                .orElseThrow(() -> new IllegalArgumentException("Container not found in the specified scrapyard"));

        ScrapYard yard = scrapYardRepo.findById(yardId).orElseThrow(() ->
                new IllegalArgumentException("The scrapyard does not exist"));

        return new ContainerStockResponse(
                container.getId(),
                container.getDescription(),
                container.getMaterialType(),
                container.getContainerSize(),
                container.getMaterialWeight(),
                yard.getName(),
                "POUNDS"
        );
    }
}
