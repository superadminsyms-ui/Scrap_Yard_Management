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
    private final CompanyRepo companyRepo;

    public CompanyServImpl(CompanyRepo companyRepo) {
        this.companyRepo = companyRepo;
    }


    @Override
    public List<CompanyDTOResponse> getAllCompanies() {
        if (companyRepo.findAll().isEmpty()) {
            throw new IllegalArgumentException("There are no registered companies");
        }
        return companyRepo.findAll().stream().map(comp ->
                new CompanyDTOResponse(comp.getId(), comp.getName(), comp.getLocation())).toList();
    }

    @Override
    public CompanyDTOResponse getCompanyById(Long id) {
        if (!companyRepo.existsById(id)) {
            throw new IllegalArgumentException("There is no company ID: " + " " + id);
        }
        Company company = companyRepo.findById(id).get();
        return new CompanyDTOResponse(company.getId(), company.getName(), company.getLocation());
    }


    @Override
    public CompanyDTOResponse getCompanyByName(String name) {

        if (!companyRepo.existsByname(name)) {
            throw new IllegalArgumentException("No Company Name : " + " " + name);
        }
        Company comp = companyRepo.findByname(name).get();

        return new CompanyDTOResponse(comp.getId(), comp.getName(), comp.getLocation());
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
    public CompanyDTOResponse updateCompany(CompanyDTORequestInsert company, Long id) {

        Company existing = companyRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The company does not exist"));

        if (company.getName().isBlank() || company.getLocation().isBlank()) {
            throw new IllegalArgumentException("There cannot be blank fields");
        }

        existing.setName(company.getName());
        existing.setLocation(company.getLocation());

        Company savedCompany = companyRepo.save(existing);

        return new CompanyDTOResponse(savedCompany.getId(),
                                      savedCompany.getName(),
                                      savedCompany.getLocation());

    }

    @Override
    public String deleteCompany(Long id) {
        if (companyRepo.existsById(id)) {
            companyRepo.deleteById(id);
            return "Company successfully removed";
        }else {
            return "Company does not exist";
        }
    }




    }

