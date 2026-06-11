package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.CashFlow.CashFlowRequestInsert;
import com.scrapyard.management.Services.ICashFlowService;
import com.scrapyard.management.Util.PageableUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/cashflow")
public class CashFlowController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "createdAt");

    @Autowired
    private final ICashFlowService cashFlowService;

    public CashFlowController(ICashFlowService cashFlowService) {
        this.cashFlowService = cashFlowService;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveCashFlow(@Valid @RequestBody CashFlowRequestInsert dto) {
        try {
            return ResponseEntity.ok(cashFlowService.saveCashFlow(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCashFlow(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(cashFlowService.getAllCashFlow(pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getAllCashFlowByManagerId(
            @PathVariable Long managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(cashFlowService.getAllCashFlowByManagerId(managerId, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/yard/{yardId}")
    public ResponseEntity<?> getAllCashFlowByScrapYard(
            @PathVariable Long yardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(cashFlowService.getAllCashFlowByScrapYard(yardId, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

}
