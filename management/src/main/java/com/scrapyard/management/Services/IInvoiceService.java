package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.InvoiceDTO.InvoiceDTORequestInsert;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse1;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface IInvoiceService {

    Page<InvoiceDTOResponse1> getAllInvoices(Pageable pageable);
    InvoiceDTOResponse getInvoiceById(Long id);
    Page<InvoiceDTOResponse1> getInvoiceByCustomer(Long customerId, Pageable pageable);
    Page<InvoiceDTOResponse1> getAllInvoicesByScrapYard(Long scrapYardId, Pageable pageable);
    InvoiceDTOResponse saveInvoice(InvoiceDTORequestInsert invoice);

}
