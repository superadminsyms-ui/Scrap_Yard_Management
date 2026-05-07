package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.CustomerDTO.CustomerDTOInsert;
import com.scrapyard.management.DTO.Response.CompanyDTO.CompanyDTOResponse;
import com.scrapyard.management.DTO.Response.CustomerDTO.CustomerDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Customer;
import com.scrapyard.management.Models.Enums.CustomerType;
import com.scrapyard.management.Models.Invoice;
import com.scrapyard.management.Repository.CompanyRepo;
import com.scrapyard.management.Repository.CustomerRepo;
import com.scrapyard.management.Repository.InvoiceRepo;
import com.scrapyard.management.Services.ICustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class CustomerServImpl implements ICustomerService {

    @Autowired
    private final CustomerRepo customerRepo;

    @Autowired
    private final CompanyRepo companyRepo;

    @Autowired
    private final InvoiceRepo invoiceRepo;


    public CustomerServImpl(CustomerRepo customerRepo, CompanyRepo companyRepo, InvoiceRepo invoiceRepo) {
        this.customerRepo = customerRepo;
        this.companyRepo = companyRepo;
        this.invoiceRepo = invoiceRepo;
    }


    @Override
    public List<CustomerDTOResponse> getAllCustomers() {

        if (customerRepo.findAll().isEmpty()) {
            throw new IllegalArgumentException("There are no registered customers");
        }

        return customerRepo.findAll().stream().map(customer ->
                new CustomerDTOResponse(customer.getId(), customer.getName(), customer.getPersonalId()
                        , customer.getTypeCustomer(), customer.getCompany().getName())).toList();

    }

    @Override
    public CustomerDTOResponse saveCustomer(CustomerDTOInsert customerDTOInsert) {

        if (customerDTOInsert.getName() == null || customerDTOInsert.getName().isBlank() ||
                customerDTOInsert.getPersonalId() == null ||
                customerDTOInsert.getTypeCustomer() == null ||
                customerDTOInsert.getCompanyId() == null) {
            throw new IllegalArgumentException("There cannot be blank fields");
        }

        Company company = companyRepo.findById(customerDTOInsert.getCompanyId()).orElseThrow(() ->
                new IllegalArgumentException("The company does not exist"));

        Customer customerEntity = new Customer();

        customerEntity.setName(customerDTOInsert.getName());
        customerEntity.setPersonalId(customerDTOInsert.getPersonalId());
        customerEntity.setTypeCustomer(customerDTOInsert.getTypeCustomer());
        customerEntity.setCompany(company);

        Customer saved = customerRepo.save(customerEntity);

        return new CustomerDTOResponse(saved.getId(), saved.getName(), saved.getPersonalId(), saved.getTypeCustomer()
                , saved.getCompany().getName());
    }


    @Override
    public CustomerDTOResponse getCustomerById(Long id) {

        if (!customerRepo.existsById(id)) {
            throw new IllegalArgumentException("There is no customer ID: " + " " + id);
        }
        Customer customer = customerRepo.findById(id).get();
        return new CustomerDTOResponse(customer.getId(), customer.getName(), customer.getPersonalId(),
                customer.getTypeCustomer(), customer.getCompany().getName());
    }

    @Override
    public List<CustomerDTOResponse> searchByName(String name) {

        List<Customer> customers = customerRepo.findByNameContainingIgnoreCase(name);

        if (customers.isEmpty()) {
            throw new IllegalArgumentException("No customer found with name containing: " + name);
        }

        return customers.stream().map(customer -> new CustomerDTOResponse(customer.getId(), customer.getName(),
                customer.getPersonalId(), customer.getTypeCustomer(), customer.getCompany().getName())).toList();
    }


    @Override
    public CustomerDTOResponse updateCustomer(CustomerDTOInsert customerInsert, Long id) {

        Customer exist = customerRepo.findById(id).orElseThrow(() ->
                new IllegalArgumentException("The customer does not exist"));

        if (customerInsert.getName() == null || customerInsert.getName().isBlank() ||
                customerInsert.getPersonalId() == null ||
                customerInsert.getTypeCustomer() == null ||
                customerInsert.getCompanyId() == null) {
            throw new IllegalArgumentException("There cannot be blank fields");
        }

        Company companyInsert = companyRepo.findById(customerInsert.getCompanyId()).orElseThrow(() ->
                new IllegalArgumentException
                        ("The company does not exist"));

        exist.setName(customerInsert.getName());
        exist.setPersonalId(customerInsert.getPersonalId());
        exist.setTypeCustomer(customerInsert.getTypeCustomer());
        exist.setCompany(companyInsert);

        Customer updated = customerRepo.save(exist);

        return new CustomerDTOResponse(updated.getId(), updated.getName(),
                updated.getPersonalId(), updated.getTypeCustomer(), updated.getCompany().getName());
    }

    @Override
    public String deleteCustomer(Long id) {
        if (customerRepo.existsById(id)) {
            customerRepo.deleteById(id);
            return "Customer successfully removed";
        } else {
            return "Customer does not exist";
        }
    }

    @Override
    public List<CustomerDTOResponse> getCustomersByCompany(Long companyId) {

        if (!companyRepo.existsById(companyId)) {
            throw new IllegalArgumentException("The company does not exist");
        }

        Company currentCompany = companyRepo.findById(companyId).get();

        if (currentCompany.getCustomers().isEmpty()) {
            throw new IllegalArgumentException("The company has no registered customers.");
        }

        return currentCompany.getCustomers().stream().map(customer -> new CustomerDTOResponse(
                customer.getId(), customer.getName(), customer.getPersonalId(), customer.getTypeCustomer(),
                customer.getCompany().getName()
        )).toList();
    }


    @Override
    public CustomerDTOResponse getCustomerByPersonalId(String personalId) {
        if (personalId == null || personalId.isBlank()) {
            throw new IllegalArgumentException(
                    "Personal ID cannot be null or blank");}
        return customerRepo.findCustomerDTOByPersonalId(personalId).orElseThrow(() ->
                new IllegalArgumentException("Customer not found"));
    }

    @Override
    public List<Invoice> getInvoicesByCustomer(Long customerId) {

        if (customerId == null) {
            throw new IllegalArgumentException("Customer ID cannot be null");
        }
        if (!customerRepo.existsById(customerId)) {
            throw new IllegalArgumentException("Customer not found");
        }
        List<Invoice> invoices = invoiceRepo.findByCustomerId(customerId);

        if (invoices.isEmpty()) {
            throw new IllegalArgumentException("Customer exists but has no invoices");
        }
        return invoices;
    }



    @Override
    public long countCustomersByCompany(Long companyId) {

        if (companyId == null || companyId <= 0) {
            throw new IllegalArgumentException("Company ID invalid");
        }

        long count = customerRepo.countByCompanyId(companyId);

        // opcional: si quieres validar existencia
        if (count == 0 && !companyRepo.existsById(companyId)) {
            throw new IllegalArgumentException("Company does not exist");
        }

        return count;
    }
}
