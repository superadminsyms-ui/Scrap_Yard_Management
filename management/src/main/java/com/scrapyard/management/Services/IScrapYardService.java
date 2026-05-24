package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestInsert;
import com.scrapyard.management.DTO.Request.ScrapYardDTO.ScrapYardDTORequestUpdate;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerDTOResponse;
import com.scrapyard.management.DTO.Response.ContainerDTO.ContainerStockResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardDTOResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapYardStockTotalResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.ScrapyardReportResponse;
import com.scrapyard.management.DTO.Response.ScrapYardDTO.dtoResponseId;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.ScrapYard;
import java.util.List;


public interface IScrapYardService {


    List<dtoResponseId> getAllScrapYard();
    ScrapYardDTOResponse getScrapYardById(Long id);
    ScrapYardDTOResponse saveScrapYard(ScrapYardDTORequestInsert scrapYard);
    List<ScrapYardDTOResponse> getScrapYardByName(String name);
    String deleteScrapYard(Long id);
    List<ScrapYardDTOResponse> getAllYardByCompany(Long companyID);
    ScrapYardDTOResponse updateScrapYard(ScrapYardDTORequestUpdate yard, Long id);
    List<ContainerDTOResponse> getContainers(Long yardId);
    ScrapYardStockTotalResponse getTotalStockByYardId(Long yardId);
    List<ContainerStockResponse> getStockByContainers(Long yardId);
    ContainerStockResponse getStockByContainerId(Long yardId, Long containerId);
    ScrapyardReportResponse getReport(Long yardId, String reportType, String period);

}
