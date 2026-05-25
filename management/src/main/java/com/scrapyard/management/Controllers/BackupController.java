package com.scrapyard.management.Controllers;

import com.scrapyard.management.DTO.BackupFileInfo;
import com.scrapyard.management.DTO.WipeRestoreRequest;
import com.scrapyard.management.Services.IBackupService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final IBackupService backupService;

    public BackupController(IBackupService backupService) {
        this.backupService = backupService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBackup() {
        BackupFileInfo info = backupService.createBackup();
        return ResponseEntity.ok(Map.of("message", "Backup created successfully", "backup", info));
    }

    @GetMapping("/list")
    public ResponseEntity<List<BackupFileInfo>> listBackups() {
        return ResponseEntity.ok(backupService.listBackups());
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadBackup(@PathVariable String filename) {
        File file = backupService.getBackupFile(filename);
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @DeleteMapping("/{filename}")
    public ResponseEntity<?> deleteBackup(@PathVariable String filename) {
        backupService.deleteBackup(filename);
        return ResponseEntity.ok(Map.of("message", "Backup deleted successfully"));
    }

    @PostMapping("/restore/{filename}")
    public ResponseEntity<?> restoreBackup(
            @PathVariable String filename,
            @Valid @RequestBody WipeRestoreRequest request
    ) {
        backupService.restoreFromBackup(filename, request);
        return ResponseEntity.ok(Map.of("message", "Backup restored successfully"));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadBackup(@RequestParam("file") MultipartFile file) {
        BackupFileInfo info = backupService.uploadBackup(file);
        return ResponseEntity.ok(Map.of("message", "Backup uploaded successfully", "backup", info));
    }

    @PostMapping("/wipe")
    public ResponseEntity<?> wipeData(@Valid @RequestBody WipeRestoreRequest request) {
        backupService.wipeAllData(request);
        return ResponseEntity.ok(Map.of("message", "All data wiped successfully"));
    }
}
