package com.scrapyard.management.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BackupFileInfo {
    private String filename;
    private long sizeBytes;
    private String createdAt;
}
