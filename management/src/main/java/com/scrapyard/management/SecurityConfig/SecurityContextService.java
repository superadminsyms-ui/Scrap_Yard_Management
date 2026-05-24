package com.scrapyard.management.SecurityConfig;

import com.scrapyard.management.Models.User;
import com.scrapyard.management.Models.Enums.UserRole;
import com.scrapyard.management.Repository.ManagerSYRepo;
import com.scrapyard.management.Repository.UserRepo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class SecurityContextService {

    private final UserRepo userRepo;
    private final ManagerSYRepo managerSYRepo;

    public SecurityContextService(UserRepo userRepo, ManagerSYRepo managerSYRepo) {
        this.userRepo = userRepo;
        this.managerSYRepo = managerSYRepo;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        String email = auth.getName();
        return userRepo.findByEmail(email).orElse(null);
    }

    public Long getCurrentYardId() {
        User user = getCurrentUser();
        if (user == null) return null;
        if (user.getRole() == UserRole.SUPERADMIN) return null;
        if (user.getManagerSY() != null && user.getManagerSY().getScrapYard() != null) {
            return user.getManagerSY().getScrapYard().getId();
        }
        return null;
    }

    public Long getCurrentCompanyId() {
        User user = getCurrentUser();
        if (user == null) return null;
        if (user.getRole() == UserRole.SUPERADMIN) return null;
        if (user.getManagerSY() != null && user.getManagerSY().getScrapYard() != null) {
            return user.getManagerSY().getScrapYard().getCompany().getId();
        }
        return null;
    }

    public boolean isSuperAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERADMIN"));
    }

    public boolean isManager() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
    }
}
