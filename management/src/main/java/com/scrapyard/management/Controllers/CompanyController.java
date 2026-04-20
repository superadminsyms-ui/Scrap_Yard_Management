package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTORequestInsert;
import com.scrapyard.management.DTO.Response.CompanyDTO.CompanyDTOResponse;
import com.scrapyard.management.Services.Impl.CompanyServImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyController {


    @Autowired
    CompanyServImpl companyServices;


    @PostMapping("/save")
    public ResponseEntity<?> saveCompany(@RequestBody CompanyDTORequestInsert company) {
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














}
