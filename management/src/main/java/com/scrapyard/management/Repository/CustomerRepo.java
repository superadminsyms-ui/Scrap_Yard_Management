package com.scrapyard.management.Repository;
import com.scrapyard.management.DTO.Response.CustomerDTO.CustomerDTOResponse;
import com.scrapyard.management.Models.Company;
import com.scrapyard.management.Models.Customer;
import com.scrapyard.management.Models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface CustomerRepo extends JpaRepository<Customer,Long> {

    Optional<Customer> findByname(String name);

    List<Customer> findByNameContainingIgnoreCase(String customerName);

    Long countByCompanyId (Long companyId);

    //Implementación de búsqueda por personalID usando JPQL
    @Query("""
        SELECT new com.scrapyard.management.DTO.Response.CustomerDTO.CustomerDTOResponse(
                c.id,
                c.name,
                c.personalId,
                c.typeCustomer,
                c.company.name
        )
        FROM Customer c
        WHERE c.personalId = :personalId
        """)
    Optional<CustomerDTOResponse> findCustomerDTOByPersonalId(
            @Param("personalId") String personalId
    );





}
