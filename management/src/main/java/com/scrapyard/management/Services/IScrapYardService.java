package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.ScrapYard;
import java.util.List;


public interface IScrapYardService {


    List<ScrapYardDTOResponse> getAllScrapYard();
    ScrapYard getScrapYardById(Long id);
    ScrapYard getScrapYardByName(String name);

    ScrapYardDTOResponse saveScrapYard(ScrapYardDTORequestInsert scrapYard);


    void deleteScrapYard(Long id);
    List<ScrapYard> getAllYardByCompany(Company company);
    ScrapYard updateScrapYard(ScrapYard yard, Long id);




}
