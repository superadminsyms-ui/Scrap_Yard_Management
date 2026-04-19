package com.scrapyard.management.Services;
import com.scrapyard.management.Models.Container;
import com.scrapyard.management.Models.Invoice;
import com.scrapyard.management.Models.InvoiceDetail;
import java.util.List;

public interface IInvoiceDetailService {

    List<InvoiceDetail> getAllInvoiceDetails();
    InvoiceDetail getInvoiceDetailById(Long id);
    List<InvoiceDetail> getAllInvoiceDetailByInvoice(Invoice invoice);
    InvoiceDetail saveInvoiceDetail(InvoiceDetail invoiceDetail);
    InvoiceDetail updateInvoiceDetail(InvoiceDetail invoiceDetail, Long id);
    void deleteInvoiceDetail(Long id);
    List<InvoiceDetail> getInvoiceDetailByContainer(Container container);







}
