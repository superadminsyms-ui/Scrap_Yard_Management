package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTORequestInsert;
import com.scrapyard.management.DTO.Response.CompanyDTO.CompanyDTOResponse;
import com.scrapyard.management.DTO.Response.CustomerDTO.CustomerDTOResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardDTOResponse;
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
    public List<CompanyDTOResponse> getCompanyByName(String name) {

        List<Company> companies = companyRepo.findByNameContainingIgnoreCase(name);

        if (companies.isEmpty()) {
            throw new IllegalArgumentException("No Company found with name containing: " + name);
        }

        return companies.stream().map(comp ->
                new CompanyDTOResponse(comp.getId(), comp.getName(), comp.getLocation())).toList();
    }





    @Override
    public CompanyDTOResponse saveCompany(CompanyDTORequestInsert company) {

        if (companyRepo.existsByName(company.getName())) {
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
        Company company = companyRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The company does not exist"));

        if (!company.getScrapYards().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete company with associated scrap yards");
        }
        if (!company.getCustomers().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete company with associated customers");
        }

        companyRepo.deleteById(id);
        return "Company successfully removed";
    }

    @Override
    public List<ScrapYardDTOResponse> getAllYards(Long companyId) {
        Company existing = companyRepo.findById(companyId).orElseThrow(() ->
                new IllegalArgumentException("The company does not exist"));

        return existing.getScrapYards().stream().map(yard -> new ScrapYardDTOResponse(yard.getCompany()
                .getName(), yard.getName(), yard.getLocation(),  yard.isActive())).toList();
    }

    @Override
    public List<CustomerDTOResponse> getAllCustomers(Long companyId) {

        if (!companyRepo.existsById(companyId)) {
            throw new IllegalArgumentException("The company does not exist");
        }

        Company existing = companyRepo.findById(companyId).get();

        if (existing.getCustomers().isEmpty()) {
            throw new IllegalArgumentException("There are no registered Customer found");
        }

        return existing.getCustomers().stream().map(customer -> new CustomerDTOResponse(
                customer.getId(), customer.getName(), customer.getPersonalId(), customer.getTypeCustomer(),
                customer.getCompany().getName()
        )).toList();
    }







}

