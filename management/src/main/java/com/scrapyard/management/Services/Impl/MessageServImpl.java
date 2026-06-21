package com.scrapyard.management.Services.Impl;
import com.scrapyard.management.DTO.Request.MessageDTO.MessageDTORequest;
import com.scrapyard.management.DTO.Response.MessageDTO.MessageDTOResponse;
import com.scrapyard.management.DTO.Response.MessageDTO.RecipientResponse;
import com.scrapyard.management.DTO.Response.MessageDTO.UnreadCountResponse;
import com.scrapyard.management.Models.Enums.UserRole;
import com.scrapyard.management.Models.Message;
import com.scrapyard.management.Models.User;
import com.scrapyard.management.Repository.MessageRepo;
import com.scrapyard.management.Repository.UserRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class MessageServImpl implements IMessageService {

    @Autowired
    private final MessageRepo messageRepo;

    @Autowired
    private final UserRepo userRepo;

    @Autowired
    private final SecurityContextService securityContextService;

    public MessageServImpl(MessageRepo messageRepo, UserRepo userRepo, SecurityContextService securityContextService) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.securityContextService = securityContextService;
    }

    @Override
    public MessageDTOResponse saveMessage(MessageDTORequest dto) {
        User sender = securityContextService.getCurrentUser();
        if (sender == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        User recipient = userRepo.findById(dto.getRecipientId())
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        if (sender.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("You cannot send a message to yourself");
        }

        if (sender.getRole() == UserRole.MANAGER) {
            boolean canSend = canManagerSendTo(sender, recipient);
            if (!canSend) {
                throw new IllegalArgumentException("You can only send messages to managers in your company or super admins");
            }
        }

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(dto.getContent());
        message.setPinned(dto.isPinned());
        message.setRead(false);

        Message saved = messageRepo.save(message);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageDTOResponse> getAllMessages(Pageable pageable) {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Long userId = currentUser.getId();
        Page<Message> messages = messageRepo.findByRecipientIdOrSenderIdOrderByPinnedDescCreatedAtDesc(
                userId, userId, pageable);

        return messages.map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageDTOResponse> getSentMessages(Pageable pageable) {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Page<Message> messages = messageRepo.findBySenderIdOrderByCreatedAtDesc(
                currentUser.getId(), pageable);

        return messages.map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageDTOResponse> getReceivedMessages(boolean unreadOnly, Pageable pageable) {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Page<Message> messages;
        if (unreadOnly) {
            messages = messageRepo.findByRecipientIdAndReadFalseOrderByPinnedDescCreatedAtDesc(
                    currentUser.getId(), pageable);
        } else {
            messages = messageRepo.findByRecipientIdOrderByPinnedDescCreatedAtDesc(
                    currentUser.getId(), pageable);
        }

        return messages.map(this::mapToDTO);
    }

    @Override
    public UnreadCountResponse getUnreadCount() {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            return new UnreadCountResponse(0);
        }

        long count = messageRepo.countByRecipientIdAndReadFalse(currentUser.getId());
        return new UnreadCountResponse(count);
    }

    @Override
    public MessageDTOResponse markAsRead(Long messageId) {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Message message = messageRepo.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getRecipient().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Only the recipient can mark a message as read");
        }

        message.setRead(true);
        Message saved = messageRepo.save(message);
        return mapToDTO(saved);
    }

    @Override
    public void markAllAsRead() {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        List<Message> unreadMessages = messageRepo.findByRecipientIdAndReadFalse(currentUser.getId());
        for (Message message : unreadMessages) {
            message.setRead(true);
        }
        messageRepo.saveAll(unreadMessages);
    }

    @Override
    public void deleteMessage(Long messageId) {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Message message = messageRepo.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        boolean isSender = message.getSender().getId().equals(currentUser.getId());
        boolean isRecipient = message.getRecipient().getId().equals(currentUser.getId());
        boolean isSuperAdmin = currentUser.getRole() == UserRole.SUPERADMIN;

        if (!isSender && !isRecipient && !isSuperAdmin) {
            throw new IllegalArgumentException("You are not authorized to delete this message");
        }

        if (isSender) {
            message.setDeletedBySender(true);
        }
        if (isRecipient) {
            message.setDeletedByRecipient(true);
        }

        if (message.isDeletedBySender() && message.isDeletedByRecipient()) {
            messageRepo.delete(message);
        } else {
            messageRepo.save(message);
        }
    }

    @Override
    public MessageDTOResponse togglePin(Long messageId) {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Message message = messageRepo.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        boolean isSender = message.getSender().getId().equals(currentUser.getId());
        boolean isRecipient = message.getRecipient().getId().equals(currentUser.getId());
        boolean isSuperAdmin = currentUser.getRole() == UserRole.SUPERADMIN;

        if (!isSender && !isRecipient && !isSuperAdmin) {
            throw new IllegalArgumentException("You are not authorized to pin this message");
        }

        message.setPinned(!message.isPinned());
        Message saved = messageRepo.save(message);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipientResponse> getRecipients() {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        List<User> allActive = userRepo.findAllByActiveTrue();
        List<RecipientResponse> recipients = new ArrayList<>();

        for (User user : allActive) {
            if (user.getId().equals(currentUser.getId())) {
                continue;
            }

            if (currentUser.getRole() == UserRole.SUPERADMIN) {
                recipients.add(mapRecipient(user));
            } else {
                boolean canSend = canManagerSendTo(currentUser, user);
                if (canSend) {
                    recipients.add(mapRecipient(user));
                }
            }
        }

        if (recipients.isEmpty()) {
            throw new IllegalArgumentException("No available recipients found");
        }

        return recipients;
    }

    private boolean canManagerSendTo(User sender, User recipient) {
        if (recipient.getRole() == UserRole.SUPERADMIN) {
            return true;
        }

        if (recipient.getRole() == UserRole.MANAGER) {
            Long senderCompanyId = null;
            if (sender.getManagerSY() != null && sender.getManagerSY().getScrapYard() != null) {
                senderCompanyId = sender.getManagerSY().getScrapYard().getCompany().getId();
            }

            Long recipientCompanyId = null;
            if (recipient.getManagerSY() != null && recipient.getManagerSY().getScrapYard() != null) {
                recipientCompanyId = recipient.getManagerSY().getScrapYard().getCompany().getId();
            }

            return senderCompanyId != null && senderCompanyId.equals(recipientCompanyId);
        }

        return false;
    }

    private RecipientResponse mapRecipient(User user) {
        String yardName = null;
        if (user.getManagerSY() != null && user.getManagerSY().getScrapYard() != null) {
            yardName = user.getManagerSY().getScrapYard().getName();
        }

        return new RecipientResponse(
                user.getId(),
                user.getManagerSY() != null ? user.getManagerSY().getName() : "Admin",
                user.getEmail(),
                user.getRole().name(),
                yardName
        );
    }

    private MessageDTOResponse mapToDTO(Message message) {
        String yardNameForSender = null;
        String yardNameForRecipient = null;
        String senderName = null;
        String recipientName = null;

        if (message.getSender().getManagerSY() != null) {
            senderName = message.getSender().getManagerSY().getName();
            if (message.getSender().getManagerSY().getScrapYard() != null) {
                yardNameForSender = message.getSender().getManagerSY().getScrapYard().getName();
            }
        }

        if (message.getRecipient().getManagerSY() != null) {
            recipientName = message.getRecipient().getManagerSY().getName();
            if (message.getRecipient().getManagerSY().getScrapYard() != null) {
                yardNameForRecipient = message.getRecipient().getManagerSY().getScrapYard().getName();
            }
        }

        if (senderName == null) {
            senderName = "Admin";
        }
        if (recipientName == null) {
            recipientName = "Admin";
        }

        return new MessageDTOResponse(
                message.getId(),
                message.getSender().getId(),
                senderName,
                message.getSender().getRole().name(),
                message.getRecipient().getId(),
                recipientName,
                message.getRecipient().getRole().name(),
                message.getContent(),
                message.isPinned(),
                message.isRead(),
                message.getCreatedAt()
        );
    }
}
