package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.Movement;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MovementRepo extends JpaRepository <Movement, Long>{

    List<Movement> findByScrapYardId(Long scrapYardId, Sort sort);
    List<Movement> findByContainerId(Long containerId, Sort sort);

    long countByScrapYardId(Long scrapYardId);

    List<Movement> findTop5ByOrderByMovementDateDesc();
    List<Movement> findTop5ByScrapYardIdOrderByMovementDateDesc(Long scrapYardId);
}
