package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Repository.CompanyRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.Services.IScrapYardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class ScrapYardServImpl implements IScrapYardService {


    @Autowired
   private final ScrapYardRepo scrapYardRepo;

    @Autowired
    private final CompanyRepo companyRepo;

    public ScrapYardServImpl(ScrapYardRepo scrapYardRepo, CompanyRepo companyRepo) {
        this.scrapYardRepo = scrapYardRepo;
        this.companyRepo = companyRepo;
    }


    @Override
    public List<ScrapYardDTOResponse> getAllScrapYard() {

        if (scrapYardRepo.findAll().isEmpty()) {
            throw new IllegalArgumentException("There are no registered ScrapYards");
        }

        return scrapYardRepo.findAll().stream().map
                (yard -> new ScrapYardDTOResponse
                        (yard.getName(), yard.getLocation(), yard.isActive())).toList();
    }

    @Override
    public ScrapYard getScrapYardById(Long id) {
        return null;
    }

    @Override
    public ScrapYard getScrapYardByName(String name) {
        return null;
    }

    @Override
    public ScrapYardDTOResponse saveScrapYard(ScrapYardDTORequestInsert scrapYardDTO) {

        ScrapYard yardEntity = new ScrapYard();

        Company company = companyRepo.findById(scrapYardDTO.getCompanyId()).
                orElseThrow(() -> new IllegalArgumentException("Company not found with ID: " + scrapYardDTO.getCompanyId()));

        yardEntity.setCompany(company);
        yardEntity.setName(scrapYardDTO.getName());
        yardEntity.setLocation(scrapYardDTO.getLocation());
        yardEntity.setActive(scrapYardDTO.isActive());

        ScrapYard saved= scrapYardRepo.save(yardEntity);

        return new ScrapYardDTOResponse(saved.getName(),saved.getLocation(),saved.isActive());
    }

    @Override
    public void deleteScrapYard(Long id) {

    }

    @Override
    public List<ScrapYard> getAllYardByCompany(Company company) {
        return List.of();
    }

    @Override
    public ScrapYard updateScrapYard(ScrapYard yard, Long id) {
        return null;
    }
}
