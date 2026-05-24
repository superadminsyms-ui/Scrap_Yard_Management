package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.ManagerSYDTO.ManagerSYDTORequestInsert;
import com.scrapyard.management.DTO.Response.ManagerSYDTO.ManagerSYDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.ManagerSY;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Repository.CompanyRepo;
import com.scrapyard.management.Repository.InvoiceRepo;
import com.scrapyard.management.Repository.ManagerSYRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IManagerSYService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class ManagerSYServImpl implements IManagerSYService {

    @Autowired
    private final ManagerSYRepo managerSYRepo;

    @Autowired
    private final CompanyRepo companyRepo;

    @Autowired
    private final ScrapYardRepo scrapYardRepo;

    @Autowired
    private final InvoiceRepo invoiceRepo;

    @Autowired
    private final SecurityContextService securityContextService;


    public ManagerSYServImpl(ManagerSYRepo managerSYRepo, CompanyRepo companyRepo, ScrapYardRepo scrapYardRepo, InvoiceRepo invoiceRepo, SecurityContextService securityContextService) {
        this.managerSYRepo = managerSYRepo;
        this.companyRepo = companyRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.invoiceRepo = invoiceRepo;
        this.securityContextService = securityContextService;
    }


    @Override
    public List<ManagerSYDTOResponse> getAllManagers() {
        Long yardId = securityContextService.getCurrentYardId();
        List<ManagerSY> managers;

        if (yardId != null) {
            ScrapYard yard = scrapYardRepo.findById(yardId)
                    .orElseThrow(() -> new IllegalArgumentException("Scrap yard not found"));
            managers = yard.getManagers();
        } else {
            managers = managerSYRepo.findAll();
        }

        if (managers.isEmpty()) {
            throw new IllegalArgumentException("There are no registered managers");
        }
        return managers.stream().map(managerSY ->
                new ManagerSYDTOResponse(managerSY.getId(), managerSY.getName(), managerSY.getEmail(),managerSY.getPhone(),
                        managerSY.getScrapYard().getName())).toList();
    }

    @Override
    public ManagerSYDTOResponse getManagerSYById(Long id) {
        Long yardId = securityContextService.getCurrentYardId();

        if (!managerSYRepo.existsById(id)) {
            throw new IllegalArgumentException("There is no manager ID: " + " " + id);
        }
        ManagerSY managerSY = managerSYRepo.findById(id).get();

        if (yardId != null && !managerSY.getScrapYard().getId().equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this manager");
        }

        return new ManagerSYDTOResponse(managerSY.getId(), managerSY.getName(),
                managerSY.getEmail(),managerSY.getPhone(),managerSY.getScrapYard().getName());
    }



    @Override
    public List<ManagerSYDTOResponse> getManagerSYByName(String name) {
        Long yardId = securityContextService.getCurrentYardId();

        List<ManagerSY> managerSYs = managerSYRepo.findByNameContainingIgnoreCase(name);

        if (yardId != null) {
            managerSYs = managerSYs.stream()
                    .filter(m -> m.getScrapYard().getId().equals(yardId))
                    .toList();
        }

        if (managerSYs.isEmpty()) {
            throw new IllegalArgumentException("No Manager found with name containing: " + name);
        }

        return managerSYs.stream().map(managerSY ->
                new ManagerSYDTOResponse(managerSY.getId(), managerSY.getName(),
                    managerSY.getEmail(),managerSY.getPhone(),
                    managerSY.getScrapYard().getName())).toList();
    }


    @Override
    public ManagerSYDTOResponse saveManagerSY(ManagerSYDTORequestInsert managerDTOInsert) {
        Long yardId = securityContextService.getCurrentYardId();
        if (yardId != null) {
            managerDTOInsert.setScrapYardId(yardId);
        }

        if (managerDTOInsert.getName() == null || managerDTOInsert.getName().isBlank() ||
                managerDTOInsert.getEmail() == null ||
                managerDTOInsert.getPhone() == null ||
                managerDTOInsert.getScrapYardId() == null || managerDTOInsert.getScrapYardId()<=0) {
            throw new IllegalArgumentException("There cannot be blank fields, cero or negative value");
        }

        ScrapYard yard = scrapYardRepo.findById(managerDTOInsert.getScrapYardId()).orElseThrow(() ->
                new IllegalArgumentException("The scrapYard does not exist"));

        ManagerSY managerSYEntity = new ManagerSY();
        managerSYEntity.setName(managerDTOInsert.getName());
        managerSYEntity.setEmail(managerDTOInsert.getEmail());
        managerSYEntity.setPhone(managerDTOInsert.getPhone());
        managerSYEntity.setScrapYard(yard);

        ManagerSY saved = managerSYRepo.save(managerSYEntity);

        return new ManagerSYDTOResponse(saved.getId(), saved.getName(),
                saved.getEmail(), saved.getPhone(), saved.getScrapYard().getName());
    }



    @Override
    public ManagerSYDTOResponse updateManager(ManagerSYDTORequestInsert manager, Long id) {
        Long yardId = securityContextService.getCurrentYardId();

        ManagerSY existing = managerSYRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The manager does not exist"));

        if (yardId != null) {
            if (!existing.getScrapYard().getId().equals(yardId)) {
                throw new IllegalArgumentException("Access denied to this manager");
            }
            manager.setScrapYardId(yardId);
        }

        if (manager.getName() == null || manager.getName().isBlank() ||
                manager.getEmail() == null ||
                manager.getPhone() == null ||
                manager.getScrapYardId() == null || manager.getScrapYardId()<=0) {
            throw new IllegalArgumentException("There cannot be blank fields, cero or negative value");
        }

        ScrapYard yard = scrapYardRepo.findById(manager.getScrapYardId()).orElseThrow(() ->
                new IllegalArgumentException("The yard does not exist"));

        existing.setName(manager.getName());
        existing.setEmail(manager.getEmail());
        existing.setPhone(manager.getPhone());
        existing.setScrapYard(yard);

        ManagerSY  managerSYEntity = managerSYRepo.save(existing);

        return new ManagerSYDTOResponse(managerSYEntity.getId(), managerSYEntity.getName(),managerSYEntity.getEmail(),
                managerSYEntity.getPhone(),managerSYEntity.getScrapYard().getName());
    }

    @Override
    public String deleteManager(Long id) {
        Long yardId = securityContextService.getCurrentYardId();

        ManagerSY manager = managerSYRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The manager does not exist"));

        if (yardId != null && !manager.getScrapYard().getId().equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this manager");
        }

        if (invoiceRepo.existsByManagerId(id)) {
            throw new IllegalArgumentException("Cannot delete manager with associated invoices");
        }

        managerSYRepo.deleteById(id);
        return "Manager successfully removed";
    }

    @Override
    public List<ManagerSYDTOResponse> getAllManagersByScrapYard(Long yardId) {
        Long currentYardId = securityContextService.getCurrentYardId();
        if (currentYardId != null && !currentYardId.equals(yardId)) {
            throw new IllegalArgumentException("Access denied to this scrap yard");
        }

        if(yardId == null ||  yardId <= 0) {
            throw new IllegalArgumentException("There cannot be blank fields, cero or negative value in ID");
        }

        if (!scrapYardRepo.existsById(yardId)) {
            throw new IllegalArgumentException("The scrapYard does not exist");
        }

        ScrapYard yard=scrapYardRepo.findById(yardId).get();
        List<ManagerSY> managers=yard.getManagers();

        if(managers==null || managers.isEmpty()) {
            throw new IllegalArgumentException("No managers found at yard ID " + yardId);
        }

        return managers.stream().map(managerSY -> new ManagerSYDTOResponse(
                managerSY.getId(), managerSY.getName(), managerSY.getEmail(),
                managerSY.getPhone(),managerSY.getScrapYard().getName()
        )).toList();
    }
}
