package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.DTO.Request.AuthDTO.UserUpdateRequest;
import com.scrapyard.management.DTO.Response.AuthDTO.UserListResponse;
import com.scrapyard.management.Models.Enums.UserRole;
import com.scrapyard.management.Models.User;
import com.scrapyard.management.Repository.UserRepo;
import com.scrapyard.management.Services.IUserService;
import com.scrapyard.management.Utils.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private final UserRepo userRepo;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    private UserListResponse toResponse(User user) {
        UserListResponse response = new UserListResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setActive(user.isActive());
        response.setMustChangePassword(user.isMustChangePassword());
        response.setCreatedAt(user.getCreatedAt());

        if (user.getManagerSY() != null) {
            response.setManagerName(user.getManagerSY().getName());
            response.setManagerId(user.getManagerSY().getId());
            response.setPhone(user.getManagerSY().getPhone());
            response.setYardId(user.getManagerSY().getScrapYard().getId());
        }

        return response;
    }

    private void requireSuperAdmin(User currentUser) {
        if (currentUser.getRole() != UserRole.SUPERADMIN) {
            throw new IllegalArgumentException("Only SUPERADMIN can manage users");
        }
    }

    @Override
    public List<UserListResponse> listAll(User currentUser) {
        requireSuperAdmin(currentUser);
        return userRepo.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserListResponse getById(Long id, User currentUser) {
        requireSuperAdmin(currentUser);
        User user = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toResponse(user);
    }

    @Override
    public UserListResponse updateUser(Long id, UserUpdateRequest request, User currentUser) {
        requireSuperAdmin(currentUser);

        User user = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean changed = false;

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equals(user.getEmail())) {
            if (userRepo.existsByEmailAndIdNot(request.getEmail(), user.getId())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.getEmail());

            if (user.getManagerSY() != null) {
                user.getManagerSY().setEmail(request.getEmail());
            }
            changed = true;
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            PasswordValidator.validate(request.getNewPassword());
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            user.setPasswordChangedAt(java.time.LocalDateTime.now());
            user.setMustChangePassword(true);
            changed = true;
        }

        if (!changed) {
            throw new IllegalArgumentException("No changes to apply");
        }

        userRepo.save(user);

        return toResponse(user);
    }

    @Override
    public UserListResponse activateUser(Long id, User currentUser) {
        requireSuperAdmin(currentUser);

        User user = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setActive(true);
        userRepo.save(user);

        return toResponse(user);
    }

    @Override
    public UserListResponse deactivateUser(Long id, User currentUser) {
        requireSuperAdmin(currentUser);

        if (currentUser.getId().equals(id)) {
            throw new IllegalArgumentException("You cannot deactivate your own account");
        }

        User user = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setActive(false);
        userRepo.save(user);

        return toResponse(user);
    }
}
