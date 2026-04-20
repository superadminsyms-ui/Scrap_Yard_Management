package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.CompanyDTORequest.CompanyDTORequestInsert;
import com.scrapyard.management.DTO.Response.CompanyDTO.CompanyDTOResponse;
import com.scrapyard.management.Models.Company;
import java.util.List;




public interface ICompanyService {

    List<CompanyDTOResponse> getAllCompanies();
    CompanyDTOResponse getCompanyById(Long id);
    CompanyDTOResponse getCompanyByName(String name);
    CompanyDTOResponse saveCompany(CompanyDTORequestInsert company);
    Company updateCompany(Company company, Long id);
    void deleteCompany(Long id);

}
