package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.CustomerDTO.CustomerDTOInsert;
import com.scrapyard.management.DTO.Response.CustomerDTO.CustomerDTOResponse;
import com.scrapyard.management.Models.Invoice;

import java.util.List;

public interface ICustomerService {

List<CustomerDTOResponse> getAllCustomers();
CustomerDTOResponse saveCustomer(CustomerDTOInsert customer);
CustomerDTOResponse getCustomerById(Long id);
List<CustomerDTOResponse> searchByName(String name);
CustomerDTOResponse updateCustomer(CustomerDTOInsert customer, Long id);
String deleteCustomer(Long id);
List<CustomerDTOResponse> getCustomersByCompany(Long companyId);
CustomerDTOResponse getCustomerByPersonalId(String personalId);
List<Invoice> getInvoicesByCustomer(Long customerId);
long countCustomersByCompany(Long companyId);



}
