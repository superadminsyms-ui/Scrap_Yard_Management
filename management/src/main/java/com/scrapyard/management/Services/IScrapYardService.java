package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.ScrapYard;
import java.util.List;


public interface IScrapYardService {


    List<ScrapYardDTOResponse> getAllScrapYard();
    ScrapYardDTOResponse getScrapYardById(Long id);
    ScrapYardDTOResponse saveScrapYard(ScrapYardDTORequestInsert scrapYard);
    ScrapYardDTOResponse getScrapYardByName(String name);
    String deleteScrapYard(Long id);
    List<ScrapYardDTOResponse> getAllYardByCompany(Long companyID);
    ScrapYardDTOResponse updateScrapYard(ScrapYardDTORequestInsert yard, Long id);




}
