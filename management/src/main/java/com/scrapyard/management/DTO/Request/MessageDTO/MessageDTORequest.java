package com.scrapyard.management.DTO.Request.MessageDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MessageDTORequest {

    @NotNull(message = "recipientId is required")
    @Positive(message = "recipientId must be a positive number")
    private Long recipientId;

    @NotBlank(message = "Content is required")
    @Size(max = 500, message = "Content must be at most 500 characters")
    private String content;

    private boolean pinned;
}
