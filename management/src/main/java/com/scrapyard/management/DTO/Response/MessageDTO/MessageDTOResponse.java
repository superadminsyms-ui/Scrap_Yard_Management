package com.scrapyard.management.DTO.Response.MessageDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MessageDTOResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private Long recipientId;
    private String recipientName;
    private String recipientRole;
    private String content;
    private boolean pinned;
    private boolean read;
    private LocalDateTime createdAt;
}
