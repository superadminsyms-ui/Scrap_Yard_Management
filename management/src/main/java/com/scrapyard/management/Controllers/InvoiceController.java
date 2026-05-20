package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTORequestInsert;
import com.scrapyard.management.DTO.Request.InvoiceDTO.InvoiceDTORequestInsert;
import com.scrapyard.management.Services.IInvoiceService;
import com.scrapyard.management.Services.Impl.InvoiceServImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {


    @Autowired
    private final IInvoiceService invoiceServices;


    public InvoiceController(InvoiceServImpl invoiceServices) {
        this.invoiceServices = invoiceServices;
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAllInvoices() {
        try {
            return ResponseEntity.ok(invoiceServices.getAllInvoices());
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
    public ResponseEntity<?> getInvoiceByCustomer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(invoiceServices.getInvoiceByCustomer(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/all-by-yard/{id}")
    public ResponseEntity<?> getAllInvoicesByScrapYard(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(invoiceServices.getAllInvoicesByScrapYard(id));
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


    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInvoice(@PathVariable Long id) {

        try {
            return ResponseEntity.ok(invoiceServices.cancelInvoice(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }









}
