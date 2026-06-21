package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTORequestInsert;
import com.scrapyard.management.Services.ICompanyService;
import com.scrapyard.management.Services.Impl.CompanyServImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyController {


    @Autowired
    private final ICompanyService companyServices;


    public CompanyController(CompanyServImpl companyServices) {
        this.companyServices = companyServices;
    }


    @PostMapping("/save")
    public ResponseEntity<?> saveCompany( @Valid @RequestBody CompanyDTORequestInsert company) {
        try {
        return ResponseEntity.ok(companyServices.saveCompany(company));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAllCompanies() {
        try {
        return ResponseEntity.ok(companyServices.getAllCompanies());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/id/{id}")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(companyServices.getCompanyById(id));
        } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("Error", e.getMessage()));
            }
    }


    @GetMapping("/search")
    public ResponseEntity<?> getCompanyByName(@RequestParam String name) {
        try {
            return ResponseEntity.ok(companyServices.getCompanyByName(name));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody CompanyDTORequestInsert company) {
        try {
            return ResponseEntity.ok(companyServices.updateCompany(company, id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(companyServices.deleteCompany(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }


    @GetMapping("/{id}/all-yards")
    public ResponseEntity<?> getAllYardsByCompanyId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(companyServices.getAllYards(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/all-customers")
    public ResponseEntity<?> getAllCustomer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(companyServices.getAllCustomers(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }










}
