package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.DTO.Response.DashboardDTO.DashboardResponse;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse1;
import com.scrapyard.management.DTO.Response.MovementDTO.MovementDTOResponse;
import com.scrapyard.management.Models.*;
import com.scrapyard.management.Repository.*;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class DashboardServImpl implements IDashboardService {

    @Autowired
    private final CompanyRepo companyRepo;

    @Autowired
    private final ScrapYardRepo scrapYardRepo;

    @Autowired
    private final ContainerRepo containerRepo;

    @Autowired
    private final CustomerRepo customerRepo;

    @Autowired
    private final InvoiceRepo invoiceRepo;

    @Autowired
    private final MovementRepo movementRepo;

    @Autowired
    private final SecurityContextService securityContextService;

    public DashboardServImpl(CompanyRepo companyRepo, ScrapYardRepo scrapYardRepo, ContainerRepo containerRepo, CustomerRepo customerRepo, InvoiceRepo invoiceRepo, MovementRepo movementRepo, SecurityContextService securityContextService) {
        this.companyRepo = companyRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.containerRepo = containerRepo;
        this.customerRepo = customerRepo;
        this.invoiceRepo = invoiceRepo;
        this.movementRepo = movementRepo;
        this.securityContextService = securityContextService;
    }

    @Override
    public DashboardResponse getStats() {
        Long yardId = securityContextService.getCurrentYardId();
        boolean isSuperAdmin = securityContextService.isSuperAdmin();

        DashboardResponse response = new DashboardResponse();

        List<Company> companies;
        List<ScrapYard> yards;
        List<Container> containers;
        List<Customer> customers;
        List<Invoice> invoices;
        List<Movement> movements;

        if (isSuperAdmin) {
            companies = companyRepo.findAll();
            yards = scrapYardRepo.findAll();
            containers = containerRepo.findAll();
            customers = customerRepo.findAll();
            invoices = invoiceRepo.findAll();
            movements = movementRepo.findAll();

            response.setTotalCompanies((long) companies.size());
            response.setTotalScrapyards((long) yards.size());
        } else {
            ScrapYard yard = scrapYardRepo.findById(yardId)
                    .orElseThrow(() -> new IllegalArgumentException("Scrap yard not found"));

            yards = List.of(yard);
            containers = yard.getContainers();
            customers = yard.getCompany().getCustomers();
            invoices = yard.getInvoices();
            movements = movementRepo.findByScrapYardId(yardId);

            response.setScrapyardName(yard.getName());
            response.setScrapyardLocation(yard.getLocation());
        }

        response.setTotalContainers((long) containers.size());
        response.setTotalCustomers((long) customers.size());
        response.setTotalInvoices((long) invoices.size());
        response.setTotalMovements((long) movements.size());

        BigDecimal totalSpent = invoices.stream()
                .map(inv -> inv.getTotalPaid() != null ? inv.getTotalPaid() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalSpent(totalSpent);

        List<InvoiceDTOResponse1> recentInvoices = invoices.stream()
                .sorted(Comparator.comparing(Invoice::getCreatedAt).reversed())
                .limit(5)
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
        response.setRecentInvoices(recentInvoices);

        List<MovementDTOResponse> recentMovements = movements.stream()
                .sorted(Comparator.comparing(Movement::getMovementDate).reversed())
                .limit(5)
                .map(this::mapMovementToDTO)
                .toList();
        response.setRecentMovements(recentMovements);

        return response;
    }

    private MovementDTOResponse mapMovementToDTO(Movement movement) {
        BigDecimal amountInLbs = movement.getUnitOfMeasure().toPounds(movement.getAmountMoved());
        return new MovementDTOResponse(
                movement.getId(),
                movement.getScrapYard().getName(),
                movement.getContainer().getId(),
                movement.getContainer().getDescription(),
                movement.getMaterialType(),
                movement.getDestination(),
                movement.getAmountMoved(),
                movement.getUnitOfMeasure(),
                amountInLbs,
                movement.getMovementDate(),
                movement.getManagerSY().getName(),
                movement.getMovementType()
        );
    }
}
