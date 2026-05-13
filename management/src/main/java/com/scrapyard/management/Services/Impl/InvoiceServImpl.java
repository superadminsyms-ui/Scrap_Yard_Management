package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.InvoiceDTO.InvoiceDTORequestInsert;
import com.scrapyard.management.DTO.Request.InvoiceDetailDTO.InvoiceDetailDTORequestInsert;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceCancelDTOResponse;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse;
import com.scrapyard.management.DTO.Response.InvoiceDTO.InvoiceDTOResponse1;
import com.scrapyard.management.DTO.Response.InvoiceDetailDTO.InvoiceDetailDTOResponse;
import com.scrapyard.management.Models.*;
import com.scrapyard.management.Models.Enums.InvoiceStatus;
import com.scrapyard.management.Repository.*;
import com.scrapyard.management.Services.IInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.scrapyard.management.Mapper.mapDetail;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;



@Service
public class InvoiceServImpl implements IInvoiceService {

    @Autowired
    private mapDetail mapDetail;

    @Autowired
    private final InvoiceRepo invoiceRepo;

    @Autowired
    private final CustomerRepo customerRepo;

    @Autowired
    private final ScrapYardRepo scrapYardRepo;

    @Autowired
    private final ContainerRepo containerRepo;

    @Autowired
    private final ManagerSYRepo managerSYRepo;

    public InvoiceServImpl(InvoiceRepo invoiceRepo, CustomerRepo customerRepo, ScrapYardRepo scrapYardRepo, ContainerRepo containerRepo, ManagerSYRepo managerSYRepo) {
        this.invoiceRepo = invoiceRepo;
        this.customerRepo = customerRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.containerRepo = containerRepo;
        this.managerSYRepo = managerSYRepo;
    }

    @Override
    public List<InvoiceDTOResponse1> getAllInvoices() {

        if (invoiceRepo.findAll().isEmpty()) {
            throw new IllegalArgumentException("No invoices are registered");
        }

        return invoiceRepo.findAll().stream().map(invoice -> new InvoiceDTOResponse1(invoice.getId(),
                invoice.getCustomer().getName(),invoice.getCustomer().getTypeCustomer(),
                invoice.getScrapYard().getName(), invoice.getScrapYard().getId(),
                invoice.getCreatedAt(),invoice.getTotalPaid(), invoice.getDiscount(),invoice.getStatus(),
                invoice.getCancelledAt())).toList();
    }

    @Override
    public InvoiceDTOResponse getInvoiceById(Long id) {

        if(id == null || id<=0 ){
            throw new IllegalArgumentException("The ID cannot be null, zero, or negative.");
        }

        if (invoiceRepo.findById(id).isEmpty()) {
            throw new IllegalArgumentException("Invoice with id " + id + " does not exist");
        }

        Invoice invoice = invoiceRepo.findById(id).get();

        if(invoice.getStatus() == InvoiceStatus.CANCELLED){
            throw new IllegalArgumentException(
                    "Cannot operate on a cancelled invoice"
            );
        }

        List<InvoiceDetailDTOResponse> detailsDtoResponses =
                invoice.getDetails()
                        .stream()
                        .map(mapDetail::mapDetailFunc)
                        .toList();

        return new InvoiceDTOResponse(invoice.getCustomer().getName(),
                invoice.getId(), invoice.getCustomer().getId(),
                invoice.getCustomer().getTypeCustomer(),
                invoice.getScrapYard().getName(),invoice.getScrapYard().getId(),
                invoice.getCreatedAt(), detailsDtoResponses, invoice.getTotalPaid(),
                invoice.getDiscount(), invoice.getManager().getName());

    }


    @Override
    public List<InvoiceDTOResponse1> getInvoiceByCustomer(Long customerId) {
        if (!customerRepo.existsById(customerId)) {
            throw new IllegalArgumentException("There is no customer ID: " + " " + customerId);
        }
        List<Invoice> invoices = invoiceRepo.findByCustomerId(customerId);

        if (invoices.isEmpty()) {
            throw new IllegalArgumentException("No invoices are registered with this customer");
        }
        List<InvoiceDTOResponse1> activeInvoices = invoices.stream()

                // IGNORA CANCELADAS
                .filter(invoice -> invoice.getStatus() != InvoiceStatus.CANCELLED)

                .map(invoice -> new InvoiceDTOResponse1(
                        invoice.getId(),
                        invoice.getCustomer().getName(),
                        invoice.getCustomer().getTypeCustomer(),
                        invoice.getScrapYard().getName(),
                        invoice.getScrapYard().getId(),
                        invoice.getCreatedAt(),
                        invoice.getTotalPaid(),
                        invoice.getDiscount(),
                        invoice.getStatus(),
                        invoice.getCancelledAt()
                ))
                .toList();
        if (activeInvoices.isEmpty()) {
            throw new IllegalArgumentException(
                    "All invoices for this customer are cancelled"
            );
        }

        return activeInvoices;
    }



    @Override
    public List<InvoiceDTOResponse1> getAllInvoicesByScrapYard(Long scrapYardId) {

        if(scrapYardId == null || scrapYardId<=0 ){
            throw new IllegalArgumentException("The ID cannot be null, zero, or negative.");
        }

        if (!scrapYardRepo.existsById(scrapYardId)) {
            throw new IllegalArgumentException("There is no scrapyard ID: " + scrapYardId);
        }

        ScrapYard yard = scrapYardRepo.findById(scrapYardId).get();
        List<Invoice> invoices=yard.getInvoices();

        if (invoices.isEmpty()) {
            throw new IllegalArgumentException("No invoices are registered with this scrapyard");
        }

        List<InvoiceDTOResponse1> activeInvoices = invoices.stream()

                // IGNORA CANCELADAS
                .filter(invoice -> invoice.getStatus() != InvoiceStatus.CANCELLED)

                .map(invoice -> new InvoiceDTOResponse1(
                        invoice.getId(),
                        invoice.getCustomer().getName(),
                        invoice.getCustomer().getTypeCustomer(),
                        invoice.getScrapYard().getName(),
                        invoice.getScrapYard().getId(),
                        invoice.getCreatedAt(),
                        invoice.getTotalPaid(),
                        invoice.getDiscount(),
                        invoice.getStatus(),
                        invoice.getCancelledAt()
                ))
                .toList();
        if (activeInvoices.isEmpty()) {
            throw new IllegalArgumentException(
                    "All invoices for this yard are cancelled"
            );
        }
        return activeInvoices;
    }


    @Override
    public InvoiceDTOResponse saveInvoice(InvoiceDTORequestInsert invoiceDto) {

        // 1. Validar customer
        Customer customer = customerRepo.findById(invoiceDto.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // 2. Validar scrapyard
        ScrapYard scrapyard = scrapYardRepo.findById(invoiceDto.getScrapYardId())
                .orElseThrow(() -> new IllegalArgumentException("ScrapYard not found"));

        ManagerSY manager = managerSYRepo.findById(invoiceDto.getManagerId())
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));


        if(!manager.getScrapYard().getId().equals(scrapyard.getId())){
            throw new IllegalArgumentException(
                    "Manager must belong to the yard");
        }

        // VALIDACIÓN DE NEGOCIO
        if (!customer.getCompany().getId()
                .equals(scrapyard.getCompany().getId())) {

            throw new IllegalArgumentException(
                    "Customer and ScrapYard must belong to the same company");
        }

        // VALIDAR DETAILS
        if (invoiceDto.getDetails() == null || invoiceDto.getDetails().isEmpty()) {
            throw new IllegalArgumentException(
                    "Invoice must contain at least one detail"
            );
        }

        // Crear invoice
        Invoice invoice = new Invoice();
        invoice.setStatus(InvoiceStatus.ACTIVE);
        invoice.setCustomer(customer);
        invoice.setScrapYard(scrapyard);
        invoice.setDiscount(invoiceDto.getDiscount());
        invoice.setManager(manager);

        List<InvoiceDetail> detailEntities = new ArrayList<>();

        BigDecimal total = BigDecimal.ZERO;

        // Procesar details
        for (InvoiceDetailDTORequestInsert detailDTO : invoiceDto.getDetails()) {

            Container container = containerRepo.findById(detailDTO.getContainerId())
                    .orElseThrow(() -> new IllegalArgumentException("Container not found"));

            // VALIDACIÓN DE NEGOCIO
            if (!container.getMaterialType().equals(detailDTO.getMaterialType())) {
                throw new IllegalArgumentException(
                        "Material type mismatch: container has "
                                + container.getMaterialType()
                                + " but detail has "
                                + detailDTO.getMaterialType()
                );
            }

            if (!container.getScrapYard().getId().equals(scrapyard.getId())) {
                throw new IllegalArgumentException(
                        "Container does not belong to this ScrapYard"
                );
            }

            InvoiceDetail detail = new InvoiceDetail();

            detail.setInvoice(invoice);
            detail.setMaterialType(detailDTO.getMaterialType());
            detail.setUnit(detailDTO.getUnit());
            detail.setWeight(detailDTO.getWeight());
            detail.setUnitPrice(detailDTO.getUnitPrice());
            detail.setContainer(container);


            BigDecimal subtotal = detail.getSubtotal();
            total = total.add(subtotal);

            detailEntities.add(detail);
        }

        // Aplicar descuento
        if (invoice.getDiscount() != null) {
            total = total.subtract(invoice.getDiscount());
        }

        if (total.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Total cannot be negative"
            );
        }

        invoice.setDetails(detailEntities);
        invoice.setTotalPaid(total);

        // 6. Guardar invoice (cascade guarda details)
        Invoice saved = invoiceRepo.save(invoice);

        List<InvoiceDetailDTOResponse> detailsDtoResponses =
                saved.getDetails()
                        .stream()
                        .map(mapDetail::mapDetailFunc)
                        .toList();

        return new InvoiceDTOResponse(saved.getCustomer().getName(),
                saved.getId(), saved.getCustomer().getId(),
                saved.getCustomer().getTypeCustomer(),
                saved.getScrapYard().getName(),saved.getScrapYard().getId(),
                saved.getCreatedAt(), detailsDtoResponses,
                saved.getTotalPaid(), saved.getDiscount(),
                saved.getManager().getName());
    }

    @Override
    public InvoiceCancelDTOResponse cancelInvoice(Long id) {

        Invoice invoice = invoiceRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalArgumentException("Invoice already cancelled");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoice.setCancelledAt(LocalDateTime.now());

        Invoice saved = invoiceRepo.save(invoice);

        return new InvoiceCancelDTOResponse(
                saved.getId(),
                saved.getStatus(),
                saved.getCancelledAt()
        );
    }


}
