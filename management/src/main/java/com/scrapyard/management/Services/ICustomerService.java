package com.scrapyard.management.Services;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Customer;
import com.scrapyard.management.Models.Enums.CustomerType;

import java.util.List;

public interface ICustomerService {

List<Customer> getAllCustomers();
Customer getCustomerById(Long id);
Customer getCustomerByName(String name);
Customer saveCustomer(Customer customer);
Customer updateCustomer(Customer customer, Long id);
void deleteCustomer(Long id);
List<Customer> getCustomerTypeByCompany(Company company, CustomerType customerType);



}
