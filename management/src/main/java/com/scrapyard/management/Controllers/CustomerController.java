package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTORequestInsert;
import com.scrapyard.management.DTO.Request.CustomerDTO.CustomerDTOInsert;
import com.scrapyard.management.Services.Impl.CustomerServImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {


    @Autowired
    private final CustomerServImpl customerServices;


    public CustomerController(CustomerServImpl customerServices) {
        this.customerServices = customerServices;
    }


    @PostMapping("/save")
    public ResponseEntity<?> saveCustomer(@Valid @RequestBody CustomerDTOInsert customerDTOInsert) {
        try {
            return ResponseEntity.ok(customerServices.saveCustomer(customerDTOInsert));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> allCustomers() {
        try {
            return ResponseEntity.ok(customerServices.getAllCustomers());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/id/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(customerServices.getCustomerById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/search")
    public ResponseEntity<?> getCustomerByName(@RequestParam String name) {
        try {
            return ResponseEntity.ok(customerServices.searchByName(name));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDTOInsert customerInsert) {
        try {
            return ResponseEntity.ok(customerServices.updateCustomer(customerInsert, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(customerServices.deleteCustomer(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/all-by-company/{id}")
    public ResponseEntity<?> getCustomerByCompanyID(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(customerServices.getCustomersByCompany(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/search-by-personal-id")
    public ResponseEntity<?> getCustomerByPersonalId(@RequestParam String personalId) {
        try {
            return ResponseEntity.ok(customerServices.getCustomerByPersonalId(personalId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }



    @GetMapping("/{customerId}/invoices")
    public ResponseEntity<?> getInvoicesByCustomer(@PathVariable Long customerId) {
        try {
            return ResponseEntity.ok(
                    customerServices.getInvoicesByCustomer(customerId)
            );
        } catch (IllegalArgumentException e) {return ResponseEntity.badRequest().body(Map.of
                ("error", e.getMessage()));
        }
    }

    @GetMapping("/count-by-company-id/{companyId}")
    public ResponseEntity<?> getCountCustomerByCompanyId(@PathVariable Long companyId) {
        try {
            return ResponseEntity.ok(
                    customerServices.countCustomersByCompany(companyId)
            );
        } catch (IllegalArgumentException e) {return ResponseEntity.badRequest().body(Map.of
                ("error", e.getMessage()));
        }
    }













}
