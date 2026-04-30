package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.DTO.Response.CompanyDTO.CompanyDTOResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Repository.CompanyRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.Services.IScrapYardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;


@Service
public class ScrapYardServImpl implements IScrapYardService {


    @Autowired
    private final ScrapYardRepo scrapYardRepo;
    @Autowired
    private final CompanyRepo companyRepo;
    @Autowired
    private final CompanyServImpl companyServImpl;





    public ScrapYardServImpl(ScrapYardRepo scrapYardRepo, CompanyRepo companyRepo, CompanyServImpl companyServImpl) {
        this.scrapYardRepo = scrapYardRepo;
        this.companyRepo = companyRepo;
        this.companyServImpl = companyServImpl;
    }


    @Override
    public List<ScrapYardDTOResponse> getAllScrapYard() {

        if (scrapYardRepo.findAll().isEmpty()) {
            throw new IllegalArgumentException("There are no registered ScrapYards");
        }

        return scrapYardRepo.findAll().stream().map
                (yard -> new ScrapYardDTOResponse
                        (yard.getCompany().getName(), yard.getName(), yard.getLocation(), yard.isActive())).toList();
    }

    @Override
    public ScrapYardDTOResponse getScrapYardById(Long id) {

        if (!scrapYardRepo.existsById(id)) {
            throw new IllegalArgumentException("There is no scrapyard ID: " + " " + id);
        }

        Optional<ScrapYard> yard= scrapYardRepo.findById(id);

        return new ScrapYardDTOResponse(yard.get().getCompany().getName(),yard.get().getName(),
                yard.get().getLocation(),yard.get().isActive());
    }


    @Override
    public ScrapYardDTOResponse getScrapYardByName(String name) {

        if (!scrapYardRepo.existsByname(name)) {
            throw new IllegalArgumentException("No yard name : " + " " + name + " " + " " + "found");
        }

        Optional<ScrapYard> found= scrapYardRepo.findByname(name);

        return new ScrapYardDTOResponse(found.get().getCompany().getName(),found.get().getName(),
                found.get().getLocation(),found.get().isActive());
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

        return new ScrapYardDTOResponse(saved.getCompany().getName(),saved.getName(),saved.getLocation(),saved.isActive());
    }

    @Override
    public String deleteScrapYard(Long id) {
        if (scrapYardRepo.existsById(id)) {
            scrapYardRepo.deleteById(id);
            return "ScrapYard successfully removed";
        }else {
            return "ScrapYard does not exist";
        }
    }


    @Override
    public List<ScrapYardDTOResponse> getAllYardByCompany(Long companyID) {

        Company entity = companyRepo.findById(companyID).orElseThrow(() -> new IllegalArgumentException
                ("Company not found with ID: " + companyID));

        return entity.getScrapYards().stream().map(yard -> new ScrapYardDTOResponse(
                yard.getCompany().getName(),yard.getName(),yard.getLocation(), yard.isActive()
        )).toList();
    }



    @Override
    public ScrapYardDTOResponse updateScrapYard(ScrapYardDTORequestInsert yard, Long id) {

        ScrapYard existing = scrapYardRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The scrapyard does not exist"));

        if (yard.getName().isBlank() || yard.getLocation().isBlank() || yard.getCompanyId() == null) {
            throw new IllegalArgumentException("There cannot be blank fields");
        }

        existing.setName(yard.getName());
        existing.setLocation(yard.getLocation());
        existing.setActive(yard.isActive());

        ScrapYard saved = scrapYardRepo.save(existing);

        return new ScrapYardDTOResponse(saved.getCompany().getName(),
                saved.getName(),saved.getLocation(),saved.isActive());
    }
}
