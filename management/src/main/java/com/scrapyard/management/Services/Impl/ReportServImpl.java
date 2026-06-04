package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ReportDTO.ReportDTORequestInsert;
import com.scrapyard.management.DTO.Response.ReportDTO.ReportDTOResponse;
import com.scrapyard.management.Services.IReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ReportServImpl implements IReportService {


    @Override
    public Page<ReportDTOResponse> getAllReports(Pageable pageable) {
        return null;
    }








    @Override
    public ReportDTOResponse getReportById(Long id) {
        return null;
    }

    @Override
    public ReportDTOResponse saveReport(ReportDTORequestInsert reportDTO) {
        return null;
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
