package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.ReportDTO.ReportDTORequestInsert;
import com.scrapyard.management.DTO.Response.ReportDTO.ReportDTOResponse;
import com.scrapyard.management.DTO.Response.ReportDTO.ReportTemplateResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface IReportService {

    Page<ReportDTOResponse> getAllReports(Pageable pageable);

    Page<ReportDTOResponse> getReportsByDateRange(LocalDateTime startDate,
                                                  LocalDateTime endDate,
                                                  Pageable pageable);
    Page<ReportDTOResponse> getReportsByDate(LocalDate date, Pageable pageable);

    ReportDTOResponse getReportById(Long id);

    ReportDTOResponse saveReport(ReportDTORequestInsert reportDTO);

    ReportTemplateResponse getReportTemplateFromInvoices(Long scrapYardId);

    boolean existsReportToday(Long scrapYardId);

    Page<ReportDTOResponse> getAllReportsByScrapYard(Long scrapYardId, Pageable pageable);

    Page<ReportDTOResponse> getReportsByManager(Long managerId, Pageable pageable);

    Page<ReportDTOResponse> getReportsByScrapYardAndDateRange(Long scrapYardId,
                                                              LocalDateTime startDate,
                                                              LocalDateTime endDate,
                                                              Pageable pageable);











}
