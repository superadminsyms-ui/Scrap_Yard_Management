package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTORequestInsert;
import com.scrapyard.management.DTO.Response.CompanyDTO.CompanyDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Repository.CompanyRepo;
import com.scrapyard.management.Services.ICompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CompanyServImpl implements ICompanyService {


    @Autowired
    CompanyRepo companyRepo;


    @Override
    public List<CompanyDTOResponse> getAllCompanies() {
        return companyRepo.findAll().stream().map(comp ->
                new CompanyDTOResponse(comp.getId(), comp.getName(), comp.getLocation())).toList();
    }

    @Override
    public Company getCompanyById(Long id) {
        return null;
    }

    @Override
    public Company getCompanyByName(String name) {
        return null;
    }

    @Override
    public CompanyDTOResponse saveCompany(CompanyDTORequestInsert company) {

        if (companyRepo.existsByname(company.getName())) {
            throw new IllegalArgumentException("There is already a company with name: " + company.getName());
        }

        Company companyEntity = new Company();
        companyEntity.setName(company.getName());
        companyEntity.setLocation(company.getLocation());
        Company savedCompany = companyRepo.save(companyEntity);

        return new CompanyDTOResponse(savedCompany.getId(),
                   savedCompany.getName(), savedCompany.getLocation());
    }

    @Override
    public Company updateCompany(Company company, Long id) {
        return null;
    }

    @Override
    public void deleteCompany(Long id) {

    }
}
