package com.scrapyard.management.Services;
import com.scrapyard.management.Models.ManagerSY;
import com.scrapyard.management.Models.ScrapYard;
import java.util.List;

public interface IManagerSYService {


    List<ManagerSY> getAllManagers();
    ManagerSY getManagerSYById(Long id);
    ManagerSY getManagerSYByName(String name);
    ManagerSY saveManagerSY(ManagerSY manager);
    ManagerSY updateManager(ManagerSY manager, Long id);
    void deleteManager(Long id);
    List<ManagerSY> getAllManagersByScrapYard(ScrapYard yard);


}
