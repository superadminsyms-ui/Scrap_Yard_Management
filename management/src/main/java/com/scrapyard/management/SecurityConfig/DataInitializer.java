package com.scrapyard.management.SecurityConfig;

import com.scrapyard.management.Models.User;
import com.scrapyard.management.Models.Enums.UserRole;
import com.scrapyard.management.Repository.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DataInitializer {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        if (!userRepo.existsByEmail("admin@scrapyard.com")) {
            User admin = new User();
            admin.setEmail("admin@scrapyard.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.SUPERADMIN);
            admin.setActive(true);
            admin.setMustChangePassword(true);
            userRepo.save(admin);
        }
    }
}
