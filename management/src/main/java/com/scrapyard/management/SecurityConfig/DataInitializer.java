package com.scrapyard.management.SecurityConfig;
import com.scrapyard.management.Models.User;
import com.scrapyard.management.Models.Enums.UserRole;
import com.scrapyard.management.Repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Component
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-password:#{null}}")
    private String defaultPassword;

    public DataInitializer(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        try {
            if (userRepo.existsByEmail("admin@syms.com") && !userRepo.existsByEmail("superadminsyms@gmail.com")) {
                userRepo.findByEmail("admin@syms.com").ifPresent(u -> {
                    u.setEmail("superadminsyms@gmail.com");
                    userRepo.save(u);
                });
                log.info("Migrated legacy admin email 'admin@syms.com' to 'superadminsyms@gmail.com'");
            }

            if (!userRepo.existsByEmail("superadminsyms@gmail.com")) {
                String password = (defaultPassword != null && !defaultPassword.isBlank())
                        ? defaultPassword
                        : "Adm1n$" + java.util.UUID.randomUUID().toString().substring(0, 6);
                User admin = new User();
                admin.setEmail("superadminsyms@gmail.com");
                admin.setPassword(passwordEncoder.encode(password));
                admin.setRole(UserRole.SUPERADMIN);
                admin.setActive(true);
                admin.setMustChangePassword(true);
                userRepo.save(admin);
                if (defaultPassword == null || defaultPassword.isBlank()) {
                    log.warn("======================================================");
                    log.warn("DEFAULT ADMIN CREATED with email: superadminsyms@gmail.com");
                    log.warn("Temporary password: {}", password);
                    log.warn("CHANGE THIS PASSWORD IMMEDIATELY after first login.");
                    log.warn("======================================================");
                }
            }
        } catch (Exception e) {
            log.warn("Admin user already exists or could not be created: {}", e.getMessage());
        }
    }
}
