package com.scrapyard.management.Models;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "scrap_yard", indexes = {
    @Index(name = "idx_scrapyard_company_id", columnList = "company_id")
})
public class ScrapYard {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, unique = true)
    private String name;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToMany(mappedBy = "scrapYard", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Container> containers=new ArrayList<>();

    @OneToMany(mappedBy = "scrapYard", fetch = FetchType.LAZY)
    private List<Invoice> invoices=new ArrayList<>();

    @OneToMany(mappedBy = "scrapYard", fetch = FetchType.LAZY)
    private List<Report> reports=new ArrayList<>();

    @OneToMany(mappedBy = "scrapYard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ManagerSY> managers=new ArrayList<>();

    @OneToMany(mappedBy = "scrapYard" , cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    private List<Movement> movements=new ArrayList<>();

    @OneToMany(mappedBy = "scrapYard", fetch = FetchType.LAZY)
    private List<CashFlow> cashFlows=new ArrayList<>();



}
