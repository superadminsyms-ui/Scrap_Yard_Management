package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.ReportDTO.ReportDTORequestInsert;
import com.scrapyard.management.Services.IReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/report")
public class ReportController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "createdAt", "balance");

    @Autowired
    private final IReportService reportService;


    public ReportController(IReportService reportService) {
        this.reportService = reportService;
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = buildPageable(page, size, sortBy, direction);
            return ResponseEntity.ok(reportService.getAllReports(pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/by-date")
    public ResponseEntity<?> getReportsByDate(
            @RequestParam LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = buildPageable(page, size, sortBy, direction);
            return ResponseEntity.ok(reportService.getReportsByDate(date, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/by-date-range")
    public ResponseEntity<?> getReportsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = buildPageable(page, size, sortBy, direction);
            return ResponseEntity.ok(reportService.getReportsByDateRange(
                    startDate.atStartOfDay(), endDate.atTime(23, 59, 59), pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/template-from-invoices")
    public ResponseEntity<?> getTemplateFromInvoices(
            @RequestParam Long scrapYardId) {
        try {
            return ResponseEntity.ok(reportService.getReportTemplateFromInvoices(scrapYardId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/exists-today")
    public ResponseEntity<?> existsReportToday(@RequestParam Long scrapYardId) {
        return ResponseEntity.ok(Map.of("exists", reportService.existsReportToday(scrapYardId)));
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveReport(@Valid @RequestBody ReportDTORequestInsert reportDTO) {
        try {
            return ResponseEntity.ok(reportService.saveReport(reportDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    private Pageable buildPageable(int page, int size, String sortBy, String direction) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new IllegalArgumentException("Invalid sort field: " + sortBy);
        }
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return PageRequest.of(page, size, sort);
    }

}




