package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.DTO.BackupFileInfo;
import com.scrapyard.management.DTO.WipeRestoreRequest;
import com.scrapyard.management.Models.User;
import com.scrapyard.management.Repository.UserRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IBackupService;
import com.scrapyard.management.config.BackupStorageProperties;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class BackupServImpl implements IBackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupServImpl.class);

    private final BackupStorageProperties backupProperties;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextService securityContextService;
    private final UserRepo userRepo;

    @PersistenceContext
    private EntityManager entityManager;

    private String dbHost;
    private String dbPort;
    private String dbName;
    private String dbUser;
    private String dbPassword;

    public BackupServImpl(
            BackupStorageProperties backupProperties,
            PasswordEncoder passwordEncoder,
            SecurityContextService securityContextService,
            UserRepo userRepo,
            org.springframework.core.env.Environment env
    ) {
        this.backupProperties = backupProperties;
        this.passwordEncoder = passwordEncoder;
        this.securityContextService = securityContextService;
        this.userRepo = userRepo;

        String jdbcUrl = env.getProperty("spring.datasource.url");
        this.dbUser = env.getProperty("spring.datasource.username");
        this.dbPassword = env.getProperty("spring.datasource.password");

        if (jdbcUrl != null) {
            String cleanUrl = jdbcUrl.replace("jdbc:mysql://", "");
            int slashIndex = cleanUrl.indexOf("/");
            String hostPort = cleanUrl.substring(0, slashIndex);
            this.dbName = cleanUrl.substring(slashIndex + 1).split("\\?")[0];

            int colonIndex = hostPort.indexOf(":");
            this.dbHost = hostPort.substring(0, colonIndex);
            this.dbPort = hostPort.substring(colonIndex + 1);
        }

        createBackupDirIfNotExists();
    }

    private void createBackupDirIfNotExists() {
        try {
            Path dir = Paths.get(backupProperties.getDir());
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }
        } catch (IOException e) {
            log.error("Failed to create backup directory: {}", e.getMessage());
        }
    }

    @Override
    public BackupFileInfo createBackup() {
        validateAdminAccess();

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss"));
        String zipFilename = "backup_" + timestamp + ".zip";
        String sqlFilename = "backup_" + timestamp + ".sql";

        Path sqlPath = Paths.get(backupProperties.getDir(), sqlFilename);
        Path zipPath = Paths.get(backupProperties.getDir(), zipFilename);

        try {
            runMySqlDump(sqlPath.toString());
            compressToZip(sqlPath, zipPath);
            Files.deleteIfExists(sqlPath);

            return buildFileInfo(zipPath);
        } catch (Exception e) {
            try { Files.deleteIfExists(sqlPath); } catch (IOException ignored) {}
            try { Files.deleteIfExists(zipPath); } catch (IOException ignored) {}
            throw new RuntimeException("Failed to create backup: " + e.getMessage(), e);
        }
    }

    @Override
    public List<BackupFileInfo> listBackups() {
        validateAdminAccess();

        List<BackupFileInfo> backups = new ArrayList<>();
        Path dir = Paths.get(backupProperties.getDir());

        if (!Files.exists(dir)) return backups;

        try (var stream = Files.list(dir)) {
            stream.filter(p -> p.toString().endsWith(".zip"))
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> backups.add(buildFileInfo(p)));
        } catch (IOException e) {
            throw new RuntimeException("Failed to list backups: " + e.getMessage(), e);
        }

        return backups;
    }

    @Override
    public File getBackupFile(String filename) {
        validateAdminAccess();

        Path path = Paths.get(backupProperties.getDir(), filename).normalize();
        if (!path.startsWith(Paths.get(backupProperties.getDir()).normalize())) {
            throw new IllegalArgumentException("Invalid filename");
        }

        if (!Files.exists(path)) {
            throw new IllegalArgumentException("Backup file not found: " + filename);
        }

        return path.toFile();
    }

    @Override
    public void restoreFromBackup(String filename, WipeRestoreRequest request) {
        validateConfirmation(request, "RESTORE");
        validateAdminPassword(request.getPassword());

        Path zipPath = Paths.get(backupProperties.getDir(), filename).normalize();
        if (!Files.exists(zipPath)) {
            throw new IllegalArgumentException("Backup file not found: " + filename);
        }

        Path sqlPath = zipPath.resolveSibling("restore_temp_" + System.currentTimeMillis() + ".sql");

        try {
            extractZip(zipPath, sqlPath);
            runMySqlRestore(sqlPath.toString());
            Files.deleteIfExists(sqlPath);

            resetAdminPassword();
        } catch (Exception e) {
            try { Files.deleteIfExists(sqlPath); } catch (IOException ignored) {}
            throw new RuntimeException("Failed to restore backup: " + e.getMessage(), e);
        }
    }

    @Override
    public BackupFileInfo uploadBackup(MultipartFile file) {
        validateAdminAccess();

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.endsWith(".zip")) {
            throw new IllegalArgumentException("Only .zip files are allowed");
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss"));
        String filename = "upload_" + timestamp + "_" + originalFilename;
        Path destPath = Paths.get(backupProperties.getDir(), filename);

        try {
            file.transferTo(destPath.toFile());
            return buildFileInfo(destPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload backup: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void wipeAllData(WipeRestoreRequest request) {
        validateConfirmation(request, "DELETE");
        validateAdminPassword(request.getPassword());

        try {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

            entityManager.createNativeQuery("DELETE FROM movement").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM invoice_detail").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM invoice").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM container").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM manager_sy").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM user WHERE email != 'admin@scrapyard.com'").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM customer").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM scrap_yard").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM company").executeUpdate();

            entityManager.createNativeQuery("ALTER TABLE movement AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE invoice_detail AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE invoice AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE container AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE manager_sy AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE user AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE customer AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE scrap_yard AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE company AUTO_INCREMENT = 1").executeUpdate();

            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
        } catch (Exception e) {
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
            throw new RuntimeException("Failed to wipe data: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteBackup(String filename) {
        validateAdminAccess();

        Path path = Paths.get(backupProperties.getDir(), filename).normalize();
        if (!path.startsWith(Paths.get(backupProperties.getDir()).normalize())) {
            throw new IllegalArgumentException("Invalid filename");
        }

        try {
            if (!Files.deleteIfExists(path)) {
                throw new IllegalArgumentException("Backup file not found: " + filename);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete backup: " + e.getMessage(), e);
        }
    }

    private void validateAdminAccess() {
        User user = securityContextService.getCurrentUser();
        if (user == null) {
            throw new AccessDeniedException("Authentication required");
        }
    }

    private void validateConfirmation(WipeRestoreRequest request, String expected) {
        if (!expected.equals(request.getConfirmation())) {
            throw new IllegalArgumentException("You must type '" + expected + "' to confirm");
        }
    }

    private void validateAdminPassword(String rawPassword) {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser == null || !passwordEncoder.matches(rawPassword, currentUser.getPassword())) {
            throw new AccessDeniedException("Invalid admin password");
        }
    }

    @Transactional
    private void resetAdminPassword() {
        userRepo.findByEmail("admin@scrapyard.com").ifPresent(admin -> {
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setMustChangePassword(true);
            userRepo.save(admin);
        });
    }

    private void runMySqlDump(String outputPath) throws IOException, InterruptedException {
        List<String> command = List.of(
                "mysqldump",
                "-h", dbHost,
                "-P", dbPort,
                "-u", dbUser,
                "--password=" + dbPassword,
                "--single-transaction",
                "--routines",
                "--triggers",
                "--databases", dbName,
                "--result-file=" + outputPath
        );

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        Thread drainer = new Thread(() -> {
            try (var is = process.getInputStream()) {
                is.transferTo(OutputStream.nullOutputStream());
            } catch (IOException ignored) {}
        });
        drainer.start();

        boolean finished = process.waitFor(5, java.util.concurrent.TimeUnit.MINUTES);
        if (!finished) {
            process.destroyForcibly();
            drainer.interrupt();
            throw new RuntimeException("mysqldump timed out");
        }

        try { drainer.join(1000); } catch (InterruptedException ignored) {}

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new RuntimeException("mysqldump failed with exit code " + exitCode);
        }
    }

    private void runMySqlRestore(String inputPath) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                "mysql",
                "-h", dbHost,
                "-P", dbPort,
                "-u", dbUser,
                "--password=" + dbPassword,
                dbName
        );
        pb.redirectInput(new File(inputPath));
        pb.redirectErrorStream(true);
        Process process = pb.start();

        Thread drainer = new Thread(() -> {
            try (var is = process.getInputStream()) {
                is.transferTo(OutputStream.nullOutputStream());
            } catch (IOException ignored) {}
        });
        drainer.start();

        boolean finished = process.waitFor(5, java.util.concurrent.TimeUnit.MINUTES);
        if (!finished) {
            process.destroyForcibly();
            drainer.interrupt();
            throw new RuntimeException("mysql restore timed out");
        }

        try { drainer.join(1000); } catch (InterruptedException ignored) {}

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new RuntimeException("mysql restore failed with exit code " + exitCode);
        }
    }

    private void compressToZip(Path source, Path dest) throws IOException {
        try (var fos = new FileOutputStream(dest.toFile());
             var zos = new ZipOutputStream(fos)) {

            ZipEntry entry = new ZipEntry(source.getFileName().toString());
            zos.putNextEntry(entry);

            try (var fis = new FileInputStream(source.toFile())) {
                byte[] buffer = new byte[4096];
                int len;
                while ((len = fis.read(buffer)) > 0) {
                    zos.write(buffer, 0, len);
                }
            }
            zos.closeEntry();
        }
    }

    private void extractZip(Path zipPath, Path destPath) throws IOException {
        try (var fis = new FileInputStream(zipPath.toFile());
             var zis = new ZipInputStream(fis)) {

            ZipEntry entry = zis.getNextEntry();
            if (entry == null) {
                throw new IllegalArgumentException("Zip file is empty");
            }

            try (var fos = new FileOutputStream(destPath.toFile())) {
                byte[] buffer = new byte[4096];
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    fos.write(buffer, 0, len);
                }
            }
            zis.closeEntry();
        }
    }

    private BackupFileInfo buildFileInfo(Path path) {
        try {
            var attrs = Files.readAttributes(path, BasicFileAttributes.class);
            return new BackupFileInfo(
                    path.getFileName().toString(),
                    attrs.size(),
                    attrs.creationTime().toString()
            );
        } catch (IOException e) {
            return new BackupFileInfo(
                    path.getFileName().toString(),
                    0,
                    "unknown"
            );
        }
    }
}
