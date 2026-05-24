package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.InvoiceDTO.InvoiceDTORequestInsert;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse1;
import com.scrapyard.management.Models.*;
import java.util.List;


public interface IInvoiceService {

    List<InvoiceDTOResponse1> getAllInvoices();
    InvoiceDTOResponse getInvoiceById(Long id);
    List<InvoiceDTOResponse1> getInvoiceByCustomer(Long customerId);
    List<InvoiceDTOResponse1> getAllInvoicesByScrapYard(Long scrapYardId);
    InvoiceDTOResponse saveInvoice(InvoiceDTORequestInsert invoice);

}
