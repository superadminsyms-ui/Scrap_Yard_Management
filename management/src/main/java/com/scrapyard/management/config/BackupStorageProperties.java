package com.scrapyard.management.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.backup")
@Getter
@Setter
public class BackupStorageProperties {

    private String dir = "./backups";
    private int maxFiles = 10;
}
