package com.scrapyard.management.Services;
import com.scrapyard.management.Models.*;
import java.util.List;


public interface IInvoiceService {


    List<Invoice> getAllInvoices();
    Invoice getInvoiceById(Long id);
    List<Invoice> getInvoiceByCustomer(Customer customer);
    List<Invoice> getAllInvoicesByScrapYard(ScrapYard scrapYard);
    Invoice saveInvoice(Invoice invoice);
    Invoice updateInvoice(Invoice invoice, Long id);
    void deleteInvoice(Long id);
    List<Invoice> getInvoiceByContainer(Container container);

}
