package com.scrapyard.management.Services;
import com.scrapyard.management.Models.Company;
import java.util.List;




public interface ICompanyService {

    List<Company> getAllCompanies();
    Company getCompanyById(Long id);
    Company getCompanyByName(String name);
    Company saveCompany(Company company);
    Company updateCompany(Company company, Long id);
    void deleteCompany(Long id);

}
