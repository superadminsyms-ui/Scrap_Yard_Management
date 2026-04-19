package com.scrapyard.management.Services;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.Enums.MaterialType;
import com.scrapyard.management.Models.ScrapYard;
import java.util.List;


public interface IContainerService {

    List<Container> getAllContainers();
    Container getContainerById(Long id);
    List<Container> getContainersByMaterial(MaterialType material);
    Container saveContainer(Container container);
    Container updateContainer(Container container, Long id);
    void deleteContainer(Long id);
    List<Container> getContainersByScrapYard(ScrapYard yard);
    List<Container> getContainersByCompany(Company company);



}
