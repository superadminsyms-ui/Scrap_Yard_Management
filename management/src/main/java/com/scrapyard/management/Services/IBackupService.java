package com.scrapyard.management.Services;

import com.scrapyard.management.DTO.BackupFileInfo;
import com.scrapyard.management.DTO.WipeRestoreRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IBackupService {

    BackupFileInfo createBackup();

    List<BackupFileInfo> listBackups();

    java.io.File getBackupFile(String filename);

    void restoreFromBackup(String filename, WipeRestoreRequest request);

    BackupFileInfo uploadBackup(MultipartFile file);

    void wipeAllData(WipeRestoreRequest request);

    void deleteBackup(String filename);
}
