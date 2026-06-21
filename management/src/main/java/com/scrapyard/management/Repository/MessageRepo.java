package com.scrapyard.management.Repository;

import com.scrapyard.management.Models.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepo extends JpaRepository<Message, Long> {

    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient.id = :recipientId AND m.read = false AND m.deletedByRecipient = false")
    long countByRecipientIdAndReadFalse(@Param("recipientId") Long recipientId);

    @EntityGraph(attributePaths = {"sender", "recipient"})
    @Query("SELECT m FROM Message m WHERE m.recipient.id = :recipientId AND m.read = false AND m.deletedByRecipient = false")
    List<Message> findByRecipientIdAndReadFalse(@Param("recipientId") Long recipientId);

    @EntityGraph(attributePaths = {"sender", "recipient"})
    @Query(value = "SELECT m FROM Message m WHERE (m.sender.id = :senderId AND m.deletedBySender = false) OR (m.recipient.id = :recipientId AND m.deletedByRecipient = false) ORDER BY m.pinned DESC, m.createdAt DESC",
           countQuery = "SELECT COUNT(m) FROM Message m WHERE (m.sender.id = :senderId AND m.deletedBySender = false) OR (m.recipient.id = :recipientId AND m.deletedByRecipient = false)")
    Page<Message> findByRecipientIdOrSenderIdOrderByPinnedDescCreatedAtDesc(@Param("recipientId") Long recipientId, @Param("senderId") Long senderId, Pageable pageable);

    @EntityGraph(attributePaths = {"sender", "recipient"})
    @Query(value = "SELECT m FROM Message m WHERE m.recipient.id = :recipientId AND m.deletedByRecipient = false ORDER BY m.pinned DESC, m.createdAt DESC",
           countQuery = "SELECT COUNT(m) FROM Message m WHERE m.recipient.id = :recipientId AND m.deletedByRecipient = false")
    Page<Message> findByRecipientIdOrderByPinnedDescCreatedAtDesc(@Param("recipientId") Long recipientId, Pageable pageable);

    @EntityGraph(attributePaths = {"sender", "recipient"})
    @Query(value = "SELECT m FROM Message m WHERE m.sender.id = :senderId AND m.deletedBySender = false ORDER BY m.createdAt DESC",
           countQuery = "SELECT COUNT(m) FROM Message m WHERE m.sender.id = :senderId AND m.deletedBySender = false")
    Page<Message> findBySenderIdOrderByCreatedAtDesc(@Param("senderId") Long senderId, Pageable pageable);

    @EntityGraph(attributePaths = {"sender", "recipient"})
    @Query(value = "SELECT m FROM Message m WHERE m.recipient.id = :recipientId AND m.read = false AND m.deletedByRecipient = false ORDER BY m.pinned DESC, m.createdAt DESC",
           countQuery = "SELECT COUNT(m) FROM Message m WHERE m.recipient.id = :recipientId AND m.read = false AND m.deletedByRecipient = false")
    Page<Message> findByRecipientIdAndReadFalseOrderByPinnedDescCreatedAtDesc(@Param("recipientId") Long recipientId, Pageable pageable);
}
