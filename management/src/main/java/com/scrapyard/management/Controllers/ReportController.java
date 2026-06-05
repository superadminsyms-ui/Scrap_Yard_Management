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




