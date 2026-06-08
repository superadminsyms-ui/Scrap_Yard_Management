package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ReportDTO.ReportDTORequestInsert;
import com.scrapyard.management.DTO.Request.ReportDTO.ReportDetailDTORequestInsert;
import com.scrapyard.management.DTO.Request.ReportDTO.SpendDTORequestInsert;
import com.scrapyard.management.DTO.Response.ReportDTO.ReportDTOResponse;
import com.scrapyard.management.DTO.Response.ReportDTO.ReportDetailDTOResponse;
import com.scrapyard.management.DTO.Response.ReportDTO.ReportTemplateResponse;
import com.scrapyard.management.DTO.Response.ReportDTO.SpendDTOResponse;
import com.scrapyard.management.Models.*;
import com.scrapyard.management.Repository.ContainerRepo;
import com.scrapyard.management.Repository.InvoiceRepo;
import com.scrapyard.management.Repository.ManagerSYRepo;
import com.scrapyard.management.Repository.ReportRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportServImpl implements IReportService {

    @Autowired
    private final SecurityContextService securityContextService;

    @Autowired
    private final ReportRepo reportRepo;

    @Autowired
    private final ScrapYardRepo scrapYardRepo;

    @Autowired
    private final ManagerSYRepo managerSYRepo;

    @Autowired
    private final ContainerRepo containerRepo;

    @Autowired
    private final InvoiceRepo invoiceRepo;



    public ReportServImpl(SecurityContextService securityContextService, ReportRepo reportRepo, ScrapYardRepo scrapYardRepo, ManagerSYRepo managerSYRepo, ContainerRepo containerRepo, InvoiceRepo invoiceRepo) {
        this.securityContextService = securityContextService;
        this.reportRepo = reportRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.managerSYRepo = managerSYRepo;
        this.containerRepo = containerRepo;
        this.invoiceRepo = invoiceRepo;
    }


    @Override
    @Transactional(readOnly = true)
    public Page<ReportDTOResponse> getAllReports(Pageable pageable) {
        Long yardId = securityContextService.getCurrentYardId();
        Page<Report> reportPage;

        if (yardId != null) {
            reportPage = reportRepo.findByScrapYardId(yardId, pageable);
        } else {
            reportPage = reportRepo.findAll(pageable);
        }

        if (reportPage.isEmpty()) {
            throw new IllegalArgumentException("No reports are registered");
        }

        List<ReportDTOResponse> dtos = reportPage.getContent().stream()
                .map(report -> new ReportDTOResponse(
                        report.getCreatedAt(),
                        report.getScrapYard().getId(),
                        report.getScrapYard().getName(),
                        report.getScrapYard().getCompany().getName(),
                        report.getManager().getName(),
                        report.getStartingBalance(),
                        report.getAddedMoney(),
                        report.getTotalInvested(),
                        report.getReportDetails().stream()
                                .map(d -> new ReportDetailDTOResponse(
                                        d.getMaterialType(),
                                        d.getWeight(),
                                        d.getUnitPrice()
                                ))
                                .toList(),
                        report.getTotalDiscount(),
                        report.getBalance(),
                        report.getSpends().stream()
                                .map(s -> new SpendDTOResponse(
                                        s.getAmount(),
                                        s.getDescription()
                                ))
                                .toList(),
                        report.getNotes()
                ))
                .toList();

        return new PageImpl<>(dtos, pageable, reportPage.getTotalElements());
    }


    @Override
    public ReportDTOResponse getReportById(Long id) {
        return null;
    }

    @Override
    @Transactional
    public ReportDTOResponse saveReport(ReportDTORequestInsert reportDTO) {

        Long yardId = securityContextService.getCurrentYardId();
        if (yardId != null) {
            reportDTO.setScrapYardId(yardId);
            if (securityContextService.getCurrentUser() != null
                    && securityContextService.getCurrentUser().getManagerSY() != null) {
                reportDTO.setManagerId(securityContextService.getCurrentUser().getManagerSY().getId());
            }
        }

        ScrapYard scrapYard = scrapYardRepo.findById(reportDTO.getScrapYardId())
                .orElseThrow(() -> new IllegalArgumentException("ScrapYard not found"));

        ManagerSY manager = managerSYRepo.findById(reportDTO.getManagerId())
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (!manager.getScrapYard().getId().equals(scrapYard.getId())) {
            throw new IllegalArgumentException("Manager must belong to the yard");
        }

        LocalDate today = LocalDate.now();
        if (reportRepo.existsByScrapYardIdAndCreatedAtBetween(
                scrapYard.getId(), today.atStartOfDay(), today.atTime(23, 59, 59))) {
            throw new IllegalArgumentException("A report already exists for this yard today");
        }

        BigDecimal maxInvested = reportDTO.getStartingBalance()
                .add(reportDTO.getAddedMoney() != null ? reportDTO.getAddedMoney() : BigDecimal.ZERO);
        if (reportDTO.getTotalInvested().compareTo(maxInvested) > 0) {
            throw new IllegalArgumentException(
                    "Total Invested cannot exceed the sum of Starting Balance and Added Money");
        }

        BigDecimal expectedBalance = maxInvested.subtract(reportDTO.getTotalInvested());
        if (reportDTO.getBalance().compareTo(expectedBalance) != 0) {
            throw new IllegalArgumentException(
                    "Balance not allowed, expected: $" + expectedBalance);
        }

        BigDecimal detailsSubtotal = BigDecimal.ZERO;
        for (ReportDetailDTORequestInsert detail : reportDTO.getReportDetails()) {
            detailsSubtotal = detailsSubtotal.add(detail.getWeight().multiply(detail.getUnitPrice()));
        }
        BigDecimal totalPaid = detailsSubtotal.subtract(
                reportDTO.getTotalDiscount() != null ? reportDTO.getTotalDiscount() : BigDecimal.ZERO);
        BigDecimal totalSpends = BigDecimal.ZERO;
        if (reportDTO.getSpends() != null) {
            for (SpendDTORequestInsert spend : reportDTO.getSpends()) {
                totalSpends = totalSpends.add(spend.getAmount());
            }
        }
        BigDecimal expectedTotalInvested = totalPaid.add(totalSpends);
        BigDecimal difference = reportDTO.getTotalInvested().subtract(expectedTotalInvested).abs();
        if (difference.compareTo(new BigDecimal("2000")) > 0) {
            throw new IllegalArgumentException(
                    "Total Invested differs from expected amount by $" + difference
                    + ". Max allowed: $2,000");
        }

        Report report = new Report();
        report.setScrapYard(scrapYard);
        report.setManager(manager);
        report.setStartingBalance(reportDTO.getStartingBalance());
        report.setAddedMoney(reportDTO.getAddedMoney());
        report.setTotalInvested(reportDTO.getTotalInvested());
        report.setTotalDiscount(reportDTO.getTotalDiscount());
        report.setBalance(reportDTO.getBalance());
        report.setNotes(reportDTO.getNotes());

        List<ReportDetail> detailEntities = new ArrayList<>();
        for (ReportDetailDTORequestInsert detailDTO : reportDTO.getReportDetails()) {
            Container container = containerRepo.findById(detailDTO.getContainerId())
                    .orElseThrow(() -> new IllegalArgumentException("Container not found"));

            if (!container.getMaterialType().equals(detailDTO.getMaterialType())) {
                throw new IllegalArgumentException("Material type mismatch: container has "
                        + container.getMaterialType() + " but detail has " + detailDTO.getMaterialType());
            }

            if (!container.getScrapYard().getId().equals(scrapYard.getId())) {
                throw new IllegalArgumentException("Container does not belong to this ScrapYard");
            }

            ReportDetail detail = new ReportDetail();
            detail.setMaterialType(detailDTO.getMaterialType());
            detail.setWeight(detailDTO.getWeight());
            detail.setUnitPrice(detailDTO.getUnitPrice());
            detail.setContainer(container);
            detail.setReport(report);
            detailEntities.add(detail);
        }
        report.setReportDetails(detailEntities);

        List<Spend> spendEntities = new ArrayList<>();
        for (SpendDTORequestInsert spendDTO : reportDTO.getSpends()) {
            Spend spend = new Spend();
            spend.setAmount(spendDTO.getAmount());
            spend.setDescription(spendDTO.getDescription());
            spend.setReport(report);
            spendEntities.add(spend);
        }
        report.setSpends(spendEntities);

        Report saved = reportRepo.save(report);

        List<ReportDetailDTOResponse> detailResponses = saved.getReportDetails().stream()
                .map(d -> new ReportDetailDTOResponse(
                        d.getMaterialType(),
                        d.getWeight(),
                        d.getUnitPrice()
                ))
                .toList();

        List<SpendDTOResponse> spendResponses = saved.getSpends().stream()
                .map(s -> new SpendDTOResponse(
                        s.getAmount(),
                        s.getDescription()
                ))
                .toList();

        return new ReportDTOResponse(
                saved.getCreatedAt(),
                saved.getScrapYard().getId(),
                saved.getScrapYard().getName(),
                saved.getScrapYard().getCompany().getName(),
                saved.getManager().getName(),
                saved.getStartingBalance(),
                saved.getAddedMoney(),
                saved.getTotalInvested(),
                detailResponses,
                saved.getTotalDiscount(),
                saved.getBalance(),
                spendResponses,
                saved.getNotes()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReportTemplateResponse getReportTemplateFromInvoices(Long scrapYardId) {
        Long yardId = securityContextService.getCurrentYardId();
        if (yardId != null) {
            scrapYardId = yardId;
        }
        if (scrapYardId == null) {
            throw new IllegalArgumentException("Scrap yard is required");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.atTime(23, 59, 59);

        List<Invoice> invoices = invoiceRepo.findByScrapYardIdAndCreatedAtBetween(scrapYardId, start, end);

        if (invoices.isEmpty()) {
            throw new IllegalArgumentException("No invoices found for this date");
        }

        BigDecimal totalDiscount = BigDecimal.ZERO;
        Map<String, ReportTemplateResponse.ReportDetailTemplate> grouped = new LinkedHashMap<>();

        for (Invoice inv : invoices) {
            if (inv.getDiscount() != null) {
                totalDiscount = totalDiscount.add(inv.getDiscount());
            }
            for (InvoiceDetail detail : inv.getDetails()) {
                String key = detail.getContainer().getId() + "_"
                           + detail.getMaterialType() + "_"
                           + detail.getUnitPrice().toString();
                if (grouped.containsKey(key)) {
                    ReportTemplateResponse.ReportDetailTemplate existing = grouped.get(key);
                    existing.setWeight(existing.getWeight().add(detail.getWeight()));
                } else {
                    ReportTemplateResponse.ReportDetailTemplate template = new ReportTemplateResponse.ReportDetailTemplate();
                    template.setMaterialType(detail.getMaterialType());
                    template.setContainerId(detail.getContainer().getId());
                    template.setWeight(detail.getWeight());
                    template.setUnitPrice(detail.getUnitPrice());
                    grouped.put(key, template);
                }
            }
        }

        ReportTemplateResponse response = new ReportTemplateResponse();
        response.setReportDetails(new ArrayList<>(grouped.values()));
        response.setTotalDiscount(totalDiscount);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportDTOResponse> getAllReportsByScrapYard(Long scrapYardId, Pageable pageable) {
        Page<Report> reportPage = reportRepo.findByScrapYardId(scrapYardId, pageable);
        if (reportPage.isEmpty()) {
            throw new IllegalArgumentException("No reports found for this yard");
        }
        return mapToResponsePage(reportPage, pageable);
    }

    @Override
    public boolean existsReportToday(Long scrapYardId) {
        Long yardId = securityContextService.getCurrentYardId();
        if (yardId != null) {
            scrapYardId = yardId;
        }
        if (scrapYardId == null) {
            return false;
        }
        LocalDate today = LocalDate.now();
        return reportRepo.existsByScrapYardIdAndCreatedAtBetween(
                scrapYardId, today.atStartOfDay(), today.atTime(23, 59, 59));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportDTOResponse> getReportsByDate(LocalDate date, Pageable pageable) {
        Long yardId = securityContextService.getCurrentYardId();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        Page<Report> reportPage;

        if (yardId != null) {
            reportPage = reportRepo.findByScrapYardIdAndCreatedAtBetween(yardId, start, end, pageable);
        } else {
            reportPage = reportRepo.findByCreatedAtBetween(start, end, pageable);
        }

        return mapToResponsePage(reportPage, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportDTOResponse> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Long yardId = securityContextService.getCurrentYardId();
        Page<Report> reportPage;

        if (yardId != null) {
            reportPage = reportRepo.findByScrapYardIdAndCreatedAtBetween(yardId, startDate, endDate, pageable);
        } else {
            reportPage = reportRepo.findByCreatedAtBetween(startDate, endDate, pageable);
        }

        return mapToResponsePage(reportPage, pageable);
    }

    private Page<ReportDTOResponse> mapToResponsePage(Page<Report> reportPage, Pageable pageable) {
        List<ReportDTOResponse> dtos = reportPage.getContent().stream()
                .map(report -> new ReportDTOResponse(
                        report.getCreatedAt(),
                        report.getScrapYard().getId(),
                        report.getScrapYard().getName(),
                        report.getScrapYard().getCompany().getName(),
                        report.getManager().getName(),
                        report.getStartingBalance(),
                        report.getAddedMoney(),
                        report.getTotalInvested(),
                        report.getReportDetails().stream()
                                .map(d -> new ReportDetailDTOResponse(
                                        d.getMaterialType(),
                                        d.getWeight(),
                                        d.getUnitPrice()
                                ))
                                .toList(),
                        report.getTotalDiscount(),
                        report.getBalance(),
                        report.getSpends().stream()
                                .map(s -> new SpendDTOResponse(
                                        s.getAmount(),
                                        s.getDescription()
                                ))
                                .toList(),
                        report.getNotes()
                ))
                .toList();

        return new PageImpl<>(dtos, pageable, reportPage.getTotalElements());
    }

    @Override
    public Page<ReportDTOResponse> getReportsByManager(Long managerId, Pageable pageable) {
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportDTOResponse> getReportsByScrapYardAndDateRange(Long scrapYardId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<Report> reportPage = reportRepo.findByScrapYardIdAndCreatedAtBetween(scrapYardId, startDate, endDate, pageable);
        if (reportPage.isEmpty()) {
            throw new IllegalArgumentException("No reports found for this yard in the specified date range");
        }
        return mapToResponsePage(reportPage, pageable);
    }
}
