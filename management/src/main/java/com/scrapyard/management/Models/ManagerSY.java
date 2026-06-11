package com.scrapyard.management.Models;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString(exclude = "scrapYard")
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "manager_sy", indexes = {
    @Index(name = "idx_manager_sy_scrapyard_id", columnList = "scrap_yard_id")
})
public class ManagerSY {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String phone;

    @ManyToOne(optional = false)
    @JoinColumn(name = "scrap_yard_id", nullable = false)
    private ScrapYard scrapYard;

    @OneToMany(mappedBy = "manager", fetch = FetchType.LAZY)
    private List<CashFlow> cashFlows=new ArrayList<>();




}
