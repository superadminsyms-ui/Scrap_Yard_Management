package com.scrapyard.management.DTO.Response.MessageDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UnreadCountResponse {

    private long unreadCount;
}
