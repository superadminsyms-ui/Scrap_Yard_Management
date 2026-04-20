package com.scrapyard.management.Controllers;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTORequestInsert;
import com.scrapyard.management.DTO.Response.CompanyDTO.CompanyDTOResponse;
import com.scrapyard.management.Services.Impl.CompanyServImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company")
public class CompanyController {


    @Autowired
    CompanyServImpl companyServices;


    @PostMapping("/save")
    public CompanyDTOResponse saveCompany(@RequestBody CompanyDTORequestInsert company) {
        return companyServices.saveCompany(company);
    }

    @GetMapping("/all")
    public List<CompanyDTOResponse> getAllCompanies() {
        return companyServices.getAllCompanies();
    }














}
