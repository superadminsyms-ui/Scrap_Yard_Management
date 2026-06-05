package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ReportDTO.ReportDTORequestInsert;
import com.scrapyard.management.DTO.Request.ReportDTO.ReportDetailDTORequestInsert;
import com.scrapyard.management.DTO.Request.ReportDTO.SpendDTORequestInsert;
import com.scrapyard.management.DTO.Response.ReportDTO.ReportDTOResponse;
import com.scrapyard.management.DTO.Response.ReportDTO.ReportDetailDTOResponse;
import com.scrapyard.management.DTO.Response.ReportDTO.SpendDTOResponse;
import com.scrapyard.management.Models.*;
import com.scrapyard.management.Repository.ContainerRepo;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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



    public ReportServImpl(SecurityContextService securityContextService, ReportRepo reportRepo, ScrapYardRepo scrapYardRepo, ManagerSYRepo managerSYRepo, ContainerRepo containerRepo) {
        this.securityContextService = securityContextService;
        this.reportRepo = reportRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.managerSYRepo = managerSYRepo;
        this.containerRepo = containerRepo;
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

        Report report = new Report();
        report.setScrapYard(scrapYard);
        report.setManager(manager);
        report.setStartingBalance(reportDTO.getStartingBalance());
        report.setAddedMoney(reportDTO.getAddedMoney());
        report.setTotalInvested(reportDTO.getTotalInvested());
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

        for (ReportDetail detail : saved.getReportDetails()) {
            Container c = detail.getContainer();
            BigDecimal weightInLbs = saved.getUnit().toPounds(detail.getWeight());
            c.setMaterialWeight(c.getMaterialWeight().add(weightInLbs));
            containerRepo.save(c);
        }

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
                saved.getManager().getName(),
                saved.getStartingBalance(),
                saved.getAddedMoney(),
                saved.getTotalInvested(),
                detailResponses,
                saved.getBalance(),
                spendResponses,
                saved.getNotes()
        );
    }

    @Override
    public Page<ReportDTOResponse> getAllReportsByScrapYard(Long scrapYardId, Pageable pageable) {
        return null;
    }

    @Override
    public Page<ReportDTOResponse> getReportsByDate(LocalDate date, Pageable pageable) {
        return null;
    }

    @Override
    public Page<ReportDTOResponse> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return null;
    }

    @Override
    public Page<ReportDTOResponse> getReportsByManager(Long managerId, Pageable pageable) {
        return null;
    }

    @Override
    public Page<ReportDTOResponse> getReportsByScrapYardAndDateRange(Long scrapYardId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return null;
    }
}
