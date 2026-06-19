package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.DTO.BackupFileInfo;
import com.scrapyard.management.DTO.WipeRestoreRequest;
import com.scrapyard.management.Exceptions.BackupException;
import com.scrapyard.management.Models.User;
import com.scrapyard.management.Repository.UserRepo;
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IBackupService;
import com.scrapyard.management.Services.ITwoFactorService;
import com.scrapyard.management.config.BackupStorageProperties;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.scrapyard.management.Utils.PasswordValidator;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class BackupServImpl implements IBackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupServImpl.class);

    private static final int ZIP_MAGIC_0 = 0x50;
    private static final int ZIP_MAGIC_1 = 0x4B;
    private static final int ZIP_MAGIC_2 = 0x03;
    private static final int ZIP_MAGIC_3 = 0x04;
    private static final int MAX_COMPRESSION_RATIO = 100;
    private static final long MAX_DECOMPRESSED_SIZE = 500 * 1024 * 1024;

    private static final List<Pattern> DANGEROUS_SQL_PATTERNS = List.of(
            Pattern.compile("(?i)INTO\\s+OUTFILE"),
            Pattern.compile("(?i)INTO\\s+DUMPFILE"),
            Pattern.compile("(?i)LOAD_FILE\\s*\\("),
            Pattern.compile("(?i)CREATE\\s+FUNCTION\\s+\\w+\\s+RETURNS"),
            Pattern.compile("(?i)GRANT\\s+"),
            Pattern.compile("(?i)REVOKE\\s+"),
            Pattern.compile("(?i)CREATE\\s+USER"),
            Pattern.compile("(?i)ALTER\\s+USER"),
            Pattern.compile("(?i)DROP\\s+USER"),
            Pattern.compile("(?i)FILE\\s+PRIVILEGE")
    );

    private final BackupStorageProperties backupProperties;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextService securityContextService;
    private final UserRepo userRepo;
    private final ITwoFactorService twoFactorService;

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
            ITwoFactorService twoFactorService,
            org.springframework.core.env.Environment env
    ) {
        this.backupProperties = backupProperties;
        this.passwordEncoder = passwordEncoder;
        this.securityContextService = securityContextService;
        this.userRepo = userRepo;
        this.twoFactorService = twoFactorService;

        Path absoluteDir = Paths.get(backupProperties.getDir()).toAbsolutePath().normalize();
        try {
            if (!Files.exists(absoluteDir)) {
                Files.createDirectories(absoluteDir);
            }
        } catch (IOException e) {
            throw new BackupException("Backup storage is unavailable",
                    "Failed to create backup directory: " + absoluteDir + " - " + e.getMessage(), e);
        }
        backupProperties.setDir(absoluteDir.toString());

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
    }

    @Override
    public BackupFileInfo createBackup() {
        validateAdminAccess();
        enforceMaxFiles();

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
        } catch (BackupException e) {
            try { Files.deleteIfExists(sqlPath); } catch (IOException ignored) {}
            try { Files.deleteIfExists(zipPath); } catch (IOException ignored) {}
            throw e;
        } catch (Exception e) {
            try { Files.deleteIfExists(sqlPath); } catch (IOException ignored) {}
            try { Files.deleteIfExists(zipPath); } catch (IOException ignored) {}
            throw new BackupException("Failed to create backup. Please try again.",
                    "Failed to create backup: " + e.getMessage(), e);
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
            throw new BackupException("Failed to list backups.",
                    "Failed to list backups: " + e.getMessage(), e);
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
    public ResponseEntity<Resource> downloadBackup(String filename) {
        File file = getBackupFile(filename);
        Resource resource = new FileSystemResource(file);
        String safeFilename = filename.replaceAll("[\\r\\n]", "");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFilename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @Override
    public void restoreFromBackup(String filename, WipeRestoreRequest request) {
        validateConfirmation(request, "RESTORE");
        validateAdminPassword(request.getPassword());
        validate2FA(request.getTwoFACode());

        Path zipPath = Paths.get(backupProperties.getDir(), filename).normalize();
        if (!Files.exists(zipPath)) {
            throw new IllegalArgumentException("Backup file not found: " + filename);
        }

        Path sqlPath = zipPath.resolveSibling("restore_temp_" + System.currentTimeMillis() + ".sql");

        try {
            extractZip(zipPath, sqlPath);
            validateSqlContent(sqlPath);
            runMySqlRestore(sqlPath.toString());
            Files.deleteIfExists(sqlPath);

            resetAdminPassword();
        } catch (BackupException e) {
            try { Files.deleteIfExists(sqlPath); } catch (IOException ignored) {}
            throw e;
        } catch (Exception e) {
            try { Files.deleteIfExists(sqlPath); } catch (IOException ignored) {}
            throw new BackupException("Failed to restore backup.",
                    "Failed to restore backup: " + e.getMessage(), e);
        }
    }

    @Override
    public BackupFileInfo uploadBackup(MultipartFile file) {
        validateAdminAccess();
        enforceMaxFiles();

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Filename is required");
        }

        String safeName = Paths.get(originalFilename).getFileName().toString();
        if (!safeName.endsWith(".zip")) {
            throw new IllegalArgumentException("Only .zip files are allowed");
        }

        long maxBytes = (long) backupProperties.getMaxUploadSizeMb() * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException("File size exceeds the maximum allowed (" + backupProperties.getMaxUploadSizeMb() + "MB)");
        }

        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            if (is.read(header) < 4) {
                throw new IllegalArgumentException("File is too small to be a valid ZIP archive");
            }
            if ((header[0] & 0xFF) != ZIP_MAGIC_0 || (header[1] & 0xFF) != ZIP_MAGIC_1
                    || (header[2] & 0xFF) != ZIP_MAGIC_2 || (header[3] & 0xFF) != ZIP_MAGIC_3) {
                throw new IllegalArgumentException("File content is not a valid ZIP archive");
            }
        } catch (IOException e) {
            throw new BackupException("Upload failed. Please verify the file is a valid backup.",
                    "Failed to read upload stream: " + e.getMessage(), e);
        }

        validateZipContent(file);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss"));
        String filename = "upload_" + timestamp + "_" + safeName;
        Path backupDir = Paths.get(backupProperties.getDir()).normalize();
        Path destPath = backupDir.resolve(filename).normalize();
        if (!destPath.startsWith(backupDir)) {
            throw new IllegalArgumentException("Invalid filename");
        }

        try {
            file.transferTo(destPath.toFile());
            return buildFileInfo(destPath);
        } catch (IOException e) {
            try { Files.deleteIfExists(destPath); } catch (IOException ignored) {}
            throw new BackupException("Upload failed. Please verify the file is a valid backup.",
                    "Failed to upload backup: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void wipeAllData(WipeRestoreRequest request) {
        validateConfirmation(request, "DELETE");
        validateAdminPassword(request.getPassword());
        validate2FA(request.getTwoFACode());

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
            throw new BackupException("Failed to wipe data.",
                    "Failed to wipe data: " + e.getMessage(), e);
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
            throw new BackupException("Failed to delete backup.",
                    "Failed to delete backup: " + e.getMessage(), e);
        }
    }

    private void validateAdminAccess() {
        User user = securityContextService.getCurrentUser();
        if (user == null) {
            throw new AccessDeniedException("Authentication required");
        }
        if (user.getRole() != com.scrapyard.management.Models.Enums.UserRole.SUPERADMIN) {
            throw new AccessDeniedException("SUPERADMIN role required");
        }
    }

    private void enforceMaxFiles() {
        Path dir = Paths.get(backupProperties.getDir());
        if (!Files.exists(dir)) return;

        try (var stream = Files.list(dir)) {
            long count = stream.filter(p -> p.toString().endsWith(".zip")).count();
            if (count >= backupProperties.getMaxFiles()) {
                throw new BackupException(
                        "Maximum number of backup files reached (" + backupProperties.getMaxFiles()
                                + "). Delete some backups first.",
                        "Max backup files limit reached: " + count + "/" + backupProperties.getMaxFiles());
            }
        } catch (IOException e) {
            throw new BackupException("Failed to check backup storage.",
                    "Failed to count backup files: " + e.getMessage(), e);
        }
    }

    private void validateZipContent(MultipartFile file) {
        try (var zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry = zis.getNextEntry();
            if (entry == null) {
                throw new BackupException("Backup file must contain exactly one .sql file.",
                        "Zip file is empty");
            }
            if (!entry.getName().endsWith(".sql")) {
                zis.closeEntry();
                throw new BackupException("Backup file must contain exactly one .sql file.",
                        "First zip entry is not a .sql file: " + entry.getName());
            }
            if (entry.isDirectory()) {
                zis.closeEntry();
                throw new BackupException("Backup file must contain exactly one .sql file.",
                        "Zip entry is a directory: " + entry.getName());
            }

            String firstLine = readFirstLine(zis);
            if (firstLine == null || !firstLine.startsWith("-- MySQL dump")) {
                zis.closeEntry();
                throw new BackupException(
                        "Backup file is not a valid MySQL dump. Only backups created by this system are accepted.",
                        "SQL does not start with mysqldump header. First line: " + firstLine);
            }

            ByteArrayOutputStream contentBuffer = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int len;
            long totalRead = 0;
            while ((len = zis.read(buffer)) > 0) {
                totalRead += len;
                if (totalRead > MAX_DECOMPRESSED_SIZE) {
                    throw new BackupException("Backup file appears to be corrupted or malicious.",
                            "SQL content exceeds max size during upload validation: " + totalRead);
                }
                contentBuffer.write(buffer, 0, len);
            }
            zis.closeEntry();

            if (zis.getNextEntry() != null) {
                throw new BackupException("Backup file must contain exactly one .sql file.",
                        "Zip contains more than one entry");
            }

            String content = new String(contentBuffer.toByteArray(), StandardCharsets.UTF_8);
            String sanitized = content.replace("\r", "");
            if (!sanitized.contains("Database: " + dbName)) {
                throw new BackupException(
                        "Backup file targets a different database. Only backups for this system are accepted.",
                        "SQL does not reference expected database. Expected: " + dbName);
            }

            validateNoDangerousSQL(sanitized);
            validateNoForeignDatabase(sanitized);
        } catch (BackupException e) {
            throw e;
        } catch (IOException e) {
            throw new BackupException("Upload failed. Please verify the file is a valid backup.",
                    "Failed to read zip content for validation: " + e.getMessage(), e);
        }
    }

    private void validateSqlContent(Path sqlPath) {
        try {
            String content = Files.readString(sqlPath, StandardCharsets.UTF_8);
            String sanitized = content.replace("\r", "");

            String firstLine = sanitized.lines().findFirst().orElse("");
            if (!firstLine.startsWith("-- MySQL dump")) {
                throw new BackupException(
                        "Backup file is not a valid MySQL dump. Only backups created by this system are accepted.",
                        "SQL does not start with mysqldump header. First line: " + firstLine);
            }

            if (!sanitized.contains("Database: " + dbName)) {
                throw new BackupException(
                        "Backup file targets a different database. Only backups for this system are accepted.",
                        "SQL does not reference expected database. Expected: " + dbName);
            }

            validateNoDangerousSQL(sanitized);
            validateNoForeignDatabase(sanitized);
        } catch (BackupException e) {
            throw e;
        } catch (IOException e) {
            throw new BackupException("Failed to validate backup content.",
                    "Failed to read SQL file for validation: " + e.getMessage(), e);
        }
    }

    private void validateNoDangerousSQL(String content) {
        for (Pattern pattern : DANGEROUS_SQL_PATTERNS) {
            if (pattern.matcher(content).find()) {
                throw new BackupException(
                        "Backup file contains disallowed SQL commands and cannot be restored.",
                        "SQL contains dangerous pattern: " + pattern.pattern());
            }
        }
    }

    private void validateNoForeignDatabase(String content) {
        Pattern usePattern = Pattern.compile("(?i)USE\\s+`?(\\w+)`?", Pattern.MULTILINE);
        var useMatcher = usePattern.matcher(content);
        while (useMatcher.find()) {
            String db = useMatcher.group(1);
            if (!db.equalsIgnoreCase(dbName)) {
                throw new BackupException(
                        "Backup file references a different database. Only backups for this system are accepted.",
                        "SQL contains USE statement targeting foreign database: " + db);
            }
        }

        Pattern createDbPattern = Pattern.compile("(?i)CREATE\\s+(DATABASE|SCHEMA)\\s+(IF NOT EXISTS\\s+)?`?(\\w+)`?", Pattern.MULTILINE);
        var createDbMatcher = createDbPattern.matcher(content);
        while (createDbMatcher.find()) {
            String db = createDbMatcher.group(3);
            if (!db.equalsIgnoreCase(dbName)) {
                throw new BackupException(
                        "Backup file references a different database. Only backups for this system are accepted.",
                        "SQL contains CREATE DATABASE targeting foreign database: " + db);
            }
        }
    }

    private String readFirstLine(ZipInputStream zis) throws IOException {
        StringBuilder sb = new StringBuilder();
        int ch;
        while ((ch = zis.read()) != -1 && sb.length() < 200) {
            if (ch == '\r') continue;
            if (ch == '\n') {
                if (sb.isEmpty()) continue;
                break;
            }
            sb.append((char) ch);
        }
        return sb.length() > 0 ? sb.toString() : null;
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

    private void validate2FA(String twoFACode) {
        User currentUser = securityContextService.getCurrentUser();
        if (currentUser != null) {
            twoFactorService.verifyRequired(currentUser, twoFACode);
        }
    }

    @Transactional
    private void resetAdminPassword() {
        String defaultPassword = "Adm1n$" + java.util.UUID.randomUUID().toString().substring(0, 6);
        userRepo.findByEmail("admin@scrapyard.com").ifPresent(admin -> {
            admin.setPassword(passwordEncoder.encode(defaultPassword));
            admin.setMustChangePassword(true);
            admin.setPasswordChangedAt(java.time.LocalDateTime.now());
            userRepo.save(admin);
            log.warn("Admin password has been reset after restore. The admin must use password recovery to set a new password.");
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
            throw new BackupException("Backup creation timed out. The database may be too large.",
                    "mysqldump timed out");
        }

        try { drainer.join(1000); } catch (InterruptedException ignored) {}

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new BackupException("Failed to create backup. Database export error.",
                    "mysqldump failed with exit code " + exitCode);
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
            throw new BackupException("Backup restoration timed out.",
                    "mysql restore timed out");
        }

        try { drainer.join(1000); } catch (InterruptedException ignored) {}

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new BackupException("Failed to restore backup. Database import error.",
                    "mysql restore failed with exit code " + exitCode);
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
        Path targetDir = destPath.getParent();
        if (targetDir == null) {
            throw new IOException("Cannot determine target directory for extraction");
        }
        Path targetDirNorm = targetDir.normalize();

        try (var fis = new FileInputStream(zipPath.toFile());
             var zis = new ZipInputStream(fis)) {

            ZipEntry entry = zis.getNextEntry();
            if (entry == null) {
                throw new IllegalArgumentException("Zip file is empty");
            }

            Path entryPath = targetDirNorm.resolve(entry.getName()).normalize();
            if (!entryPath.startsWith(targetDirNorm)) {
                zis.closeEntry();
                throw new BackupException("Invalid backup file content.",
                        "Zip entry escapes target directory: " + entry.getName());
            }

            if (entry.isDirectory()) {
                zis.closeEntry();
                throw new BackupException("Invalid backup file content.",
                        "Zip entry is a directory: " + entry.getName());
            }

            long entrySize = entry.getSize();
            if (entrySize > MAX_DECOMPRESSED_SIZE) {
                zis.closeEntry();
                throw new BackupException("Backup file appears to be corrupted or malicious.",
                        "Zip entry exceeds max decompressed size: entry=" + entry.getName()
                                + " size=" + entrySize + " limit=" + MAX_DECOMPRESSED_SIZE);
            }
            long compressedSize = entry.getCompressedSize();
            if (compressedSize > 0 && entrySize > 0
                    && entrySize / compressedSize > MAX_COMPRESSION_RATIO) {
                zis.closeEntry();
                throw new BackupException("Backup file appears to be corrupted or malicious.",
                        "Compression ratio too high (possible zip bomb): entry=" + entry.getName()
                                + " compressed=" + compressedSize + " uncompressed=" + entrySize);
            }

            try (var fos = new FileOutputStream(destPath.toFile())) {
                byte[] buffer = new byte[4096];
                long totalRead = 0;
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    totalRead += len;
                    if (totalRead > MAX_DECOMPRESSED_SIZE) {
                        throw new BackupException("Backup file appears to be corrupted or malicious.",
                                "Decompressed data exceeded limit of " + MAX_DECOMPRESSED_SIZE + " bytes");
                    }
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
