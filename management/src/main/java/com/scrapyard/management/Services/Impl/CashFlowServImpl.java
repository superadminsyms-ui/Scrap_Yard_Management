package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.CashFlow.CashFlowRequestInsert;
import com.scrapyard.management.DTO.Response.CashFlowDTO.CashFlowDTOResponse;
import com.scrapyard.management.Models.CashFlow;
import com.scrapyard.management.Models.ManagerSY;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Repository.CashFlowRepo;
import com.scrapyard.management.Repository.ManagerSYRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.ICashFlowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class CashFlowServImpl implements ICashFlowService {

    @Autowired
    private final CashFlowRepo cashFlowRepo;

    @Autowired
    private final ScrapYardRepo scrapYardRepo;

    @Autowired
    private final ManagerSYRepo managerSYRepo;

    @Autowired
    private final SecurityContextService securityContextService;

    public CashFlowServImpl(CashFlowRepo cashFlowRepo, ScrapYardRepo scrapYardRepo, ManagerSYRepo managerSYRepo, SecurityContextService securityContextService) {
        this.cashFlowRepo = cashFlowRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.managerSYRepo = managerSYRepo;
        this.securityContextService = securityContextService;
    }

    @Override
    public CashFlowDTOResponse saveCashFlow(CashFlowRequestInsert dto) {
        Long yardId = securityContextService.getCurrentYardId();
        if (yardId != null) {
            dto.setScrapYardId(yardId);
            if (securityContextService.getCurrentUser() != null
                    && securityContextService.getCurrentUser().getManagerSY() != null) {
                dto.setManagerId(securityContextService.getCurrentUser().getManagerSY().getId());
            }
        }

        ScrapYard scrapYard = scrapYardRepo.findById(dto.getScrapYardId())
                .orElseThrow(() -> new IllegalArgumentException("ScrapYard not found"));

        ManagerSY manager = managerSYRepo.findById(dto.getManagerId())
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (!manager.getScrapYard().getId().equals(scrapYard.getId())) {
            throw new IllegalArgumentException("Manager must belong to the yard");
        }

        BigDecimal startingBalance = cashFlowRepo
                .findTopByScrapYardIdOrderByCreatedAtDesc(scrapYard.getId())
                .map(CashFlow::getTotalBalance)
                .orElse(dto.getStartingBalance());

        CashFlow cashFlow = new CashFlow();
        cashFlow.setScrapYard(scrapYard);
        cashFlow.setManager(manager);
        cashFlow.setStartingBalance(startingBalance);
        cashFlow.setCashReceived(dto.getCashReceived());
        cashFlow.setCashReceivedFrom(dto.getCashReceivedFrom());
        cashFlow.setTotalSpendInDay(dto.getTotalSpendInDay());

        CashFlow saved = cashFlowRepo.save(cashFlow);

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CashFlowDTOResponse> getAllCashFlow(Pageable pageable) {
        Long yardId = securityContextService.getCurrentYardId();
        Page<CashFlow> cashFlowPage;

        if (yardId != null) {
            cashFlowPage = cashFlowRepo.findByScrapYardId(yardId, pageable);
        } else {
            cashFlowPage = cashFlowRepo.findAll(pageable);
        }

        if (cashFlowPage.isEmpty()) {
            throw new IllegalArgumentException("No cash flows are registered");
        }

        return cashFlowPage.map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CashFlowDTOResponse> getAllCashFlowByManagerId(Long managerId, Pageable pageable) {
        if (!managerSYRepo.existsById(managerId)) {
            throw new IllegalArgumentException("Manager not found with ID: " + managerId);
        }

        Long yardId = securityContextService.getCurrentYardId();
        Page<CashFlow> cashFlowPage;

        if (yardId != null) {
            ManagerSY manager = managerSYRepo.findById(managerId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
            if (!manager.getScrapYard().getId().equals(yardId)) {
                throw new IllegalArgumentException("Access denied to this manager");
            }
        }

        cashFlowPage = cashFlowRepo.findByManagerId(managerId, pageable);

        if (cashFlowPage.isEmpty()) {
            throw new IllegalArgumentException("No cash flows found for this manager");
        }

        return cashFlowPage.map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CashFlowDTOResponse> getAllCashFlowByScrapYard(Long yardId, Pageable pageable) {
        Long currentYardId = securityContextService.getCurrentYardId();
        if (currentYardId != null && !currentYardId.equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

        if (!scrapYardRepo.existsById(yardId)) {
            throw new IllegalArgumentException("ScrapYard not found with ID: " + yardId);
        }

        Page<CashFlow> cashFlowPage = cashFlowRepo.findByScrapYardId(yardId, pageable);

        if (cashFlowPage.isEmpty()) {
            throw new IllegalArgumentException("No cash flows found for this scrap yard");
        }

        return cashFlowPage.map(this::mapToDTO);
    }

    private CashFlowDTOResponse mapToDTO(CashFlow cashFlow) {
        return new CashFlowDTOResponse(
                cashFlow.getId(),
                cashFlow.getCreatedAt(),
                cashFlow.getScrapYard().getName(),
                cashFlow.getManager().getName(),
                cashFlow.getStartingBalance(),
                cashFlow.getCashReceived(),
                cashFlow.getCashReceivedFrom(),
                cashFlow.getTotalSpendInDay(),
                cashFlow.getTotalBalance()
        );
    }
}
