package com.scrapyard.management.Services;

import com.scrapyard.management.DTO.Request.MessageDTO.MessageDTORequest;
import com.scrapyard.management.DTO.Response.MessageDTO.MessageDTOResponse;
import com.scrapyard.management.DTO.Response.MessageDTO.RecipientResponse;
import com.scrapyard.management.DTO.Response.MessageDTO.UnreadCountResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IMessageService {

    MessageDTOResponse saveMessage(MessageDTORequest dto);

    Page<MessageDTOResponse> getAllMessages(Pageable pageable);

    Page<MessageDTOResponse> getSentMessages(Pageable pageable);

    Page<MessageDTOResponse> getReceivedMessages(boolean unreadOnly, Pageable pageable);

    UnreadCountResponse getUnreadCount();

    MessageDTOResponse markAsRead(Long messageId);

    void markAllAsRead();

    void deleteMessage(Long messageId);

    MessageDTOResponse togglePin(Long messageId);

    List<RecipientResponse> getRecipients();
}
