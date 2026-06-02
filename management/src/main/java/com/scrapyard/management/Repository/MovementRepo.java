package com.scrapyard.management.Repository;
import com.scrapyard.management.Models.Movement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MovementRepo extends JpaRepository<Movement, Long> {

    List<Movement> findByScrapYardId(Long scrapYardId, Sort sort);
    List<Movement> findByContainerId(Long containerId, Sort sort);

    @EntityGraph(attributePaths = {"scrapYard", "container", "managerSY"})
    Page<Movement> findByScrapYardId(Long scrapYardId, Pageable pageable);

    @EntityGraph(attributePaths = {"scrapYard", "container", "managerSY"})
    Page<Movement> findByContainerId(Long containerId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"scrapYard", "container", "managerSY"})
    Page<Movement> findAll(Pageable pageable);

    long countByScrapYardId(Long scrapYardId);

    @EntityGraph(attributePaths = {"scrapYard", "container", "managerSY"})
    List<Movement> findTop5ByOrderByMovementDateDesc();

    @EntityGraph(attributePaths = {"scrapYard", "container", "managerSY"})
    List<Movement> findTop5ByScrapYardIdOrderByMovementDateDesc(Long scrapYardId);
}
