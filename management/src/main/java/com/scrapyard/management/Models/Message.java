package com.scrapyard.management.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String content;

    @Column(nullable = false)
    private boolean pinned;

    @Column(nullable = false, name = "is_read")
    private boolean read;

    @Column(nullable = false, name = "deleted_by_sender")
    private boolean deletedBySender;

    @Column(nullable = false, name = "deleted_by_recipient")
    private boolean deletedByRecipient;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.read = false;
        this.deletedBySender = false;
        this.deletedByRecipient = false;
    }
}
