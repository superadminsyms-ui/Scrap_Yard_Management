package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;


public interface CompanyRepo extends JpaRepository<Company, Long> {


    Optional<Company> findByName(String companyName);
    boolean existsByName(String name);
   //like en sql
   List<Company> findByNameContainingIgnoreCase(String companyName);






}
