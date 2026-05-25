package com.scrapyard.management.Services.Impl;

import com.scrapyard.management.DTO.Request.AuthDTO.ChangePasswordRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.LoginRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.RegisterRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.UpdateProfileRequest;
import com.scrapyard.management.DTO.Response.AuthDTO.LoginResponse;
import com.scrapyard.management.DTO.Response.AuthDTO.RegisterResponse;
import com.scrapyard.management.DTO.Response.AuthDTO.UserInfoResponse;
import com.scrapyard.management.Models.Enums.UserRole;
import com.scrapyard.management.Models.ManagerSY;
import com.scrapyard.management.Models.ScrapYard;
import com.scrapyard.management.Models.User;
import com.scrapyard.management.Repository.ManagerSYRepo;
import com.scrapyard.management.Repository.ScrapYardRepo;
import com.scrapyard.management.Repository.UserRepo;
import com.scrapyard.management.SecurityConfig.JwtUtil;
import com.scrapyard.management.Services.IAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServImpl implements IAuthService {

    @Autowired
    private final UserRepo userRepo;

    @Autowired
    private final ManagerSYRepo managerSYRepo;

    @Autowired
    private final ScrapYardRepo scrapYardRepo;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private final JwtUtil jwtUtil;

    @Autowired
    private final AuthenticationManager authenticationManager;

    public AuthServImpl(UserRepo userRepo, ManagerSYRepo managerSYRepo, ScrapYardRepo scrapYardRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepo = userRepo;
        this.managerSYRepo = managerSYRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (DisabledException e) {
            throw new IllegalArgumentException("Your account has been deactivated from the system, please contact the super admin");
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive()) {
            throw new IllegalArgumentException("Your account has been deactivated from the system, please contact the super admin");
        }

        String token = jwtUtil.generateToken(user);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setMustChangePassword(user.isMustChangePassword());

        if (user.getManagerSY() != null) {
            response.setManagerName(user.getManagerSY().getName());
            response.setYardId(user.getManagerSY().getScrapYard().getId());
        }

        return response;
    }

    @Override
    public RegisterResponse register(RegisterRequest request, User currentUser) {
        if (currentUser.getRole() != UserRole.SUPERADMIN) {
            throw new IllegalArgumentException("Only SUPERADMIN can register new users");
        }

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (request.getRole() == UserRole.MANAGER) {
            if (request.getScrapYardId() == null) {
                throw new IllegalArgumentException("Scrap yard ID is required for MANAGER");
            }

            ScrapYard yard = scrapYardRepo.findById(request.getScrapYardId())
                    .orElseThrow(() -> new IllegalArgumentException("Scrap yard not found"));

            ManagerSY manager = new ManagerSY();
            manager.setName(request.getName());
            manager.setEmail(request.getEmail());
            manager.setPhone(request.getPhone());
            manager.setScrapYard(yard);
            ManagerSY savedManager = managerSYRepo.save(manager);

            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(UserRole.MANAGER);
            user.setActive(true);
            user.setMustChangePassword(true);
            user.setManagerSY(savedManager);
            User savedUser = userRepo.save(user);

            RegisterResponse response = new RegisterResponse();
            response.setId(savedUser.getId());
            response.setEmail(savedUser.getEmail());
            response.setRole(savedUser.getRole().name());
            response.setManagerName(savedManager.getName());
            response.setYardId(yard.getId());
            return response;
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(true);
        user.setMustChangePassword(false);
        User savedUser = userRepo.save(user);

        RegisterResponse response = new RegisterResponse();
        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole().name());
        return response;
    }

    @Override
    public UserInfoResponse getCurrentUserInfo(User user) {
        UserInfoResponse response = new UserInfoResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setMustChangePassword(user.isMustChangePassword());
        response.setActive(user.isActive());

        if (user.getManagerSY() != null) {
            response.setManagerName(user.getManagerSY().getName());
            response.setYardId(user.getManagerSY().getScrapYard().getId());
        }

        return response;
    }

    @Override
    public void changePassword(ChangePasswordRequest request, User user) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (request.getNewPassword().isBlank() || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepo.save(user);
    }

    @Override
    public UserInfoResponse updateProfile(UpdateProfileRequest request, User user) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        boolean changed = false;

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equals(user.getEmail())) {
            if (userRepo.existsByEmailAndIdNot(request.getEmail(), user.getId())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.getEmail());
            changed = true;
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(true);
            changed = true;
        }

        if (!changed) {
            throw new IllegalArgumentException("No changes to apply");
        }

        userRepo.save(user);

        return getCurrentUserInfo(user);
    }
}
