package com.scrapyard.management.Services;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.ScrapYard;
import java.util.List;




public interface IScrapYardService {


    List<ScrapYard> getAllScrapYard();
    ScrapYard getScrapYardById(Long id);
    ScrapYard getScrapYardByName(String name);
    ScrapYard saveScrapYard(ScrapYard scrapYard);
    void deleteScrapYard(Long id);
    List<ScrapYard> getAllScrapYardByCompany(Company company);







}
