package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.CashFlow.CashFlowRequestInsert;
import com.scrapyard.management.DTO.Response.CashFlowDTO.CashFlowDTOResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICashFlowService {

CashFlowDTOResponse saveCashFlow (CashFlowRequestInsert cashFlow);
Page<CashFlowDTOResponse> getAllCashFlow(Pageable pageable);
Page<CashFlowDTOResponse> getAllCashFlowByManagerId(Long managerId, Pageable pageable);
Page<CashFlowDTOResponse> getAllCashFlowByScrapYard(Long yardId, Pageable pageable);

}