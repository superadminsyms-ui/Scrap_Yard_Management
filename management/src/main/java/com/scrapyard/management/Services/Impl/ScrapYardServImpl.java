package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestUpdate;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerStockResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.*;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse1;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.Enums.ReportPeriod;
import com.scrapyard.management.Models.Invoice;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Repository.CompanyRepo;
import com.scrapyard.management.Repository.ContainerRepo;
import com.scrapyard.management.Repository.InvoiceRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IScrapYardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Autowired
    private final InvoiceRepo invoiceRepo;

    @Autowired
    private final SecurityContextService securityContextService;

    public ScrapYardServImpl(ScrapYardRepo scrapYardRepo, CompanyRepo companyRepo, CompanyServImpl companyServImpl, ContainerRepo containerRepo, InvoiceRepo invoiceRepo, SecurityContextService securityContextService) {
        this.scrapYardRepo = scrapYardRepo;
        this.companyRepo = companyRepo;
        this.companyServImpl = companyServImpl;
        this.containerRepo = containerRepo;
        this.invoiceRepo = invoiceRepo;
        this.securityContextService = securityContextService;
    }


    @Override
    public List<dtoResponseId> getAllScrapYard() {
        Long yardId = securityContextService.getCurrentYardId();
        List<ScrapYard> yards;

        if (yardId != null) {
            ScrapYard yard = scrapYardRepo.findById(yardId)
                    .orElseThrow(() -> new IllegalArgumentException("Scrap yard not found"));
            yards = List.of(yard);
        } else {
            yards = scrapYardRepo.findAll();
        }

        if (yards.isEmpty()) {
            throw new IllegalArgumentException("There are no registered ScrapYards");
        }

        return yards.stream().map
                (yard -> new dtoResponseId
                        (yard.getId(), yard.getCompany().getName(), yard.getName(), yard.getLocation(), yard.isActive())).toList();
    }

    @Override
    public ScrapYardDTOResponse getScrapYardById(Long id) {
        Long yardId = securityContextService.getCurrentYardId();
        if (yardId != null && !yardId.equals(id)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

        if (!scrapYardRepo.existsById(id)) {
            throw new IllegalArgumentException("There is no scrapyard ID: " + " " + id);
        }

        Optional<ScrapYard> yard= scrapYardRepo.findById(id);

        return new ScrapYardDTOResponse(yard.get().getCompany().getName(),yard.get().getName(),
                yard.get().getLocation(),yard.get().isActive());
    }


    @Override
    public List<ScrapYardDTOResponse> getScrapYardByName(String name) {
        Long yardId = securityContextService.getCurrentYardId();

        if(name==null || name.isEmpty()) throw new
                IllegalArgumentException("ScrapYard name cannot be empty or null");

        List<ScrapYard> found= scrapYardRepo.findByNameContainingIgnoreCase(name);

        if (yardId != null) {
            found = found.stream()
                    .filter(y -> y.getId().equals(yardId))
                    .toList();
        }

        if (found.isEmpty()) throw new IllegalArgumentException("There are no registered ScrapYards");

        return found.stream().map(yard -> new ScrapYardDTOResponse(yard.getCompany().getName(),
                yard.getName(), yard.getLocation(), yard.isActive())).toList();

    }




    @Override
    public ScrapYardDTOResponse saveScrapYard(ScrapYardDTORequestInsert scrapYardDTO) {
        if (securityContextService.getCurrentYardId() != null) {
            throw new IllegalArgumentException("Managers cannot create scrap yards");
        }

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
        if (securityContextService.getCurrentYardId() != null) {
            throw new IllegalArgumentException("Managers cannot delete scrap yards");
        }

        ScrapYard existing = scrapYardRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The scrapyard does not exist"));

        if (!existing.getInvoices().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete scrap yard with associated invoices");
        }

        scrapYardRepo.deleteById(id);
        return "ScrapYard successfully removed";
    }


    @Override
    public List<dtoResponseId> getAllYardByCompany(Long companyID) {
        Long yardId = securityContextService.getCurrentYardId();

        Company entity = companyRepo.findById(companyID).orElseThrow(() -> new IllegalArgumentException
                ("Company not found with ID: " + companyID));

        List<ScrapYard> yards = entity.getScrapYards();

        if (yardId != null) {
            yards = yards.stream().filter(y -> y.getId().equals(yardId)).toList();
        }

        return yards.stream().map(yard -> new dtoResponseId(
                yard.getId(), yard.getCompany().getName(), yard.getName(), yard.getLocation(), yard.isActive()
        )).toList();
    }



    @Override
    public ScrapYardDTOResponse updateScrapYard(ScrapYardDTORequestUpdate yard, Long id) {
        if (securityContextService.getCurrentYardId() != null) {
            throw new IllegalArgumentException("Managers cannot update scrap yards");
        }

        ScrapYard existing = scrapYardRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The scrapyard does not exist"));

        if (yard.getName().isBlank() || yard.getLocation().isBlank() ) {
            throw new IllegalArgumentException("There cannot be blank fields");
        }

        existing.setName(yard.getName());
        existing.setLocation(yard.getLocation());
        if (yard.getActive() != null) {
            existing.setActive(yard.getActive());
        }

        ScrapYard saved = scrapYardRepo.save(existing);

        return new ScrapYardDTOResponse(saved.getCompany().getName(),
                saved.getName(),saved.getLocation(),saved.isActive());
    }

    @Override
    public List<ContainerDTOResponse> getContainers(Long yardId) {
        Long currentYardId = securityContextService.getCurrentYardId();
        if (currentYardId != null && !currentYardId.equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

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
        Long currentYardId = securityContextService.getCurrentYardId();
        if (currentYardId != null && !currentYardId.equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

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
        Long currentYardId = securityContextService.getCurrentYardId();
        if (currentYardId != null && !currentYardId.equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

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
        Long currentYardId = securityContextService.getCurrentYardId();
        if (currentYardId != null && !currentYardId.equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

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

    @Override
    @Transactional(readOnly = true)
    public ScrapyardReportResponse getReport(Long yardId, String reportType, String period) {
        Long currentYardId = securityContextService.getCurrentYardId();
        if (currentYardId != null && !currentYardId.equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

        ScrapYard yard = scrapYardRepo.findById(yardId)
                .orElseThrow(() -> new IllegalArgumentException("The scrapyard does not exist"));

        ReportPeriod reportPeriod;
        try {
            reportPeriod = ReportPeriod.valueOf(period.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid period. Use: WEEKLY, MONTHLY, QUARTERLY, SEMIANNUAL");
        }

        String type = reportType.toUpperCase();
        if (!type.equals("PURCHASES") && !type.equals("PRICING")) {
            throw new IllegalArgumentException("Invalid report type. Use: PURCHASES, PRICING");
        }

        LocalDateTime startDate = reportPeriod.getStartDate();
        LocalDateTime endDate = reportPeriod.getEndDate();

        List<Invoice> invoices = invoiceRepo.findByScrapYardIdAndCreatedAtBetween(yardId, startDate, endDate);

        BigDecimal totalInvested = invoices.stream()
                .map(inv -> inv.getTotalPaid() != null ? inv.getTotalPaid() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<InvoiceDTOResponse1> invoiceDTOs = invoices.stream()
                .map(inv -> new InvoiceDTOResponse1(
                        inv.getId(),
                        inv.getCustomer().getName(),
                        inv.getCustomer().getTypeCustomer(),
                        inv.getScrapYard().getName(),
                        inv.getScrapYard().getId(),
                        inv.getCreatedAt(),
                        inv.getTotalPaid(),
                        inv.getDiscount()
                ))
                .toList();

        List<MaterialPricing> materialPricing = new ArrayList<>();

        if (type.equals("PRICING")) {
            Map<MaterialType, List<com.scrapyard.management.Models.InvoiceDetail>> grouped = invoices.stream()
                    .flatMap(inv -> inv.getDetails().stream())
                    .filter(d -> d.getMaterialType() != null && d.getWeight() != null && d.getUnitPrice() != null)
                    .collect(Collectors.groupingBy(com.scrapyard.management.Models.InvoiceDetail::getMaterialType));

            materialPricing = grouped.entrySet().stream()
                    .map(entry -> {
                        MaterialType matType = entry.getKey();
                        List<com.scrapyard.management.Models.InvoiceDetail> details = entry.getValue();

                        BigDecimal totalWeight = details.stream()
                                .map(com.scrapyard.management.Models.InvoiceDetail::getWeight)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal totalSpent = details.stream()
                                .map(com.scrapyard.management.Models.InvoiceDetail::getSubtotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal avgPrice = totalWeight.compareTo(BigDecimal.ZERO) > 0
                                ? totalSpent.divide(totalWeight, 4, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                        return new MaterialPricing(matType, totalWeight, totalSpent, avgPrice, details.size());
                    })
                    .toList();
        }

        return new ScrapyardReportResponse(
                yard.getId(),
                yard.getName(),
                type,
                reportPeriod,
                startDate,
                endDate,
                totalInvested,
                invoices.size(),
                invoiceDTOs,
                materialPricing
        );
    }

}
