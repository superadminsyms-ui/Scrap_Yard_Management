package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.InvoiceDTO.InvoiceDTORequestInsert;
import com.scrapyard.management.Services.IInvoiceService;
import com.scrapyard.management.Services.Impl.InvoiceServImpl;
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
@RequestMapping("/api/invoice")
public class InvoiceController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "createdAt", "totalPaid");

    @Autowired
    private final IInvoiceService invoiceServices;


    public InvoiceController(InvoiceServImpl invoiceServices) {
        this.invoiceServices = invoiceServices;
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = buildPageable(page, size, sortBy, direction);
            return ResponseEntity.ok(invoiceServices.getAllInvoices(pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/id/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(invoiceServices.getInvoiceById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/all-by-customer/{id}")
    public ResponseEntity<?> getInvoiceByCustomer(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = buildPageable(page, size, sortBy, direction);
            return ResponseEntity.ok(invoiceServices.getInvoiceByCustomer(id, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/all-by-yard/{id}")
    public ResponseEntity<?> getAllInvoicesByScrapYard(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = buildPageable(page, size, sortBy, direction);
            return ResponseEntity.ok(invoiceServices.getAllInvoicesByScrapYard(id, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveInvoice( @Valid @RequestBody InvoiceDTORequestInsert invoiceDto) {
        try {
            return ResponseEntity.ok(invoiceServices.saveInvoice(invoiceDto));
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
