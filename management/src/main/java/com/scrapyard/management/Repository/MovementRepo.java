package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.Movement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovementRepo extends JpaRepository <Movement, Long>{

    List<Movement> findByScrapYardId(Long scrapYardId);
    List<Movement> findByContainerId(Long containerId);
}
