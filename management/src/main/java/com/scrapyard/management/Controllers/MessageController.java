package com.scrapyard.management.Controllers;

import com.scrapyard.management.DTO.Request.MessageDTO.MessageDTORequest;
import com.scrapyard.management.Services.IMessageService;
import com.scrapyard.management.Util.PageableUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "createdAt");

    @Autowired
    private final IMessageService messageService;

    public MessageController(IMessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveMessage(@Valid @RequestBody MessageDTORequest dto) {
        try {
            return ResponseEntity.ok(messageService.saveMessage(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(messageService.getAllMessages(pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/sent")
    public ResponseEntity<?> getSentMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(messageService.getSentMessages(pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/received")
    public ResponseEntity<?> getReceivedMessages(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Pageable pageable = PageableUtil.buildPageable(page, size, sortBy, direction, ALLOWED_SORT_FIELDS);
            return ResponseEntity.ok(messageService.getReceivedMessages(unreadOnly, pageable));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        try {
            return ResponseEntity.ok(messageService.getUnreadCount());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(messageService.markAsRead(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        try {
            messageService.markAllAsRead();
            return ResponseEntity.ok(Map.of("message", "All messages marked as read"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        try {
            messageService.deleteMessage(id);
            return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/pin")
    public ResponseEntity<?> togglePin(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(messageService.togglePin(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }

    @GetMapping("/recipients")
    public ResponseEntity<?> getRecipients() {
        try {
            return ResponseEntity.ok(messageService.getRecipients());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("Error", e.getMessage()));
        }
    }
}
