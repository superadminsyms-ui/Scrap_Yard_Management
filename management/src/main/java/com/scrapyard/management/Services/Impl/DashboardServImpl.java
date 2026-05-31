package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.DTO.Response.DashboardDTO.DashboardResponse;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse1;
import com.scrapyard.management.DTO.Response.MovementDTO.MovementDTOResponse;
import com.scrapyard.management.Models.*;
import com.scrapyard.management.Repository.*;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    @Transactional(readOnly = true)
    public DashboardResponse getStats() {
        Long yardId = securityContextService.getCurrentYardId();
        boolean isSuperAdmin = securityContextService.isSuperAdmin();

        DashboardResponse response = new DashboardResponse();

        List<Invoice> recentInvoices;
        List<Movement> recentMovements;

        if (isSuperAdmin) {
            response.setTotalCompanies(companyRepo.count());
            response.setTotalScrapyards(scrapYardRepo.count());
            response.setTotalContainers(containerRepo.count());
            response.setTotalCustomers(customerRepo.count());
            response.setTotalInvoices(invoiceRepo.count());
            response.setTotalMovements(movementRepo.count());

            BigDecimal totalSpent = invoiceRepo.sumTotalPaid();
            response.setTotalSpent(totalSpent);

            recentInvoices = invoiceRepo.findTop5ByOrderByCreatedAtDesc();
            recentMovements = movementRepo.findTop5ByOrderByMovementDateDesc();
        } else {
            ScrapYard yard = scrapYardRepo.findById(yardId)
                    .orElseThrow(() -> new IllegalArgumentException("Scrap yard not found"));

            response.setScrapyardName(yard.getName());
            response.setScrapyardLocation(yard.getLocation());
            response.setTotalContainers((long) yard.getContainers().size());
            response.setTotalCustomers((long) yard.getCompany().getCustomers().size());
            response.setTotalInvoices(invoiceRepo.countByScrapYardId(yardId));
            response.setTotalMovements(movementRepo.countByScrapYardId(yardId));

            BigDecimal totalSpent = invoiceRepo.sumTotalPaidByScrapYardId(yardId);
            response.setTotalSpent(totalSpent);

            recentInvoices = invoiceRepo.findTop5ByScrapYardIdOrderByCreatedAtDesc(yardId);
            recentMovements = movementRepo.findTop5ByScrapYardIdOrderByMovementDateDesc(yardId);
        }

        response.setRecentInvoices(recentInvoices.stream()
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
                .toList());

        response.setRecentMovements(recentMovements.stream()
                .map(this::mapMovementToDTO)
                .toList());

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
