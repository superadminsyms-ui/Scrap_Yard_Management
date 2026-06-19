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
import com.scrapyard.management.SecurityConfig.SecurityContextService;
import com.scrapyard.management.Services.IAuthService;
import com.scrapyard.management.Services.ITokenRevocationService;
import com.scrapyard.management.Utils.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZoneId;

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

    @Autowired
    private final SecurityContextService securityContextService;

    @Autowired
    private final ITokenRevocationService tokenRevocationService;

    public AuthServImpl(UserRepo userRepo, ManagerSYRepo managerSYRepo, ScrapYardRepo scrapYardRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager, SecurityContextService securityContextService, ITokenRevocationService tokenRevocationService) {
        this.userRepo = userRepo;
        this.managerSYRepo = managerSYRepo;
        this.scrapYardRepo = scrapYardRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.securityContextService = securityContextService;
        this.tokenRevocationService = tokenRevocationService;
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

        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            LoginResponse response = new LoginResponse();
            response.setRequires2FA(true);
            response.setTempToken(jwtUtil.generateTempToken(user));
            response.setEmail(user.getEmail());
            return response;
        }

        return buildFullLoginResponse(user);
    }

    @Override
    public LoginResponse complete2FALogin(String tempToken, String code) {
        if (!jwtUtil.validateToken(tempToken)) {
            throw new IllegalArgumentException("Temporary token has expired. Please log in again.");
        }

        if (!jwtUtil.isTempToken(tempToken)) {
            throw new IllegalArgumentException("Invalid token type");
        }

        String userId = jwtUtil.extractUserId(tempToken);
        User user = userRepo.findById(Long.parseLong(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (code == null || code.isBlank() || code.length() != 6) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        try {
            int providedCode = Integer.parseInt(code);
            var googleAuth = new com.warrenstrange.googleauth.GoogleAuthenticator();
            if (!googleAuth.authorize(user.getTwoFactorSecret(), providedCode)) {
                throw new IllegalArgumentException("Invalid verification code");
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        return buildFullLoginResponse(user);
    }

    private LoginResponse buildFullLoginResponse(User user) {
        user.setLastActivityAt(java.time.LocalDateTime.now());
        userRepo.save(user);

        String token = jwtUtil.generateToken(user);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setMustChangePassword(user.isMustChangePassword());
        response.setRequires2FA(false);
        response.setTwoFactorEnabled(Boolean.TRUE.equals(user.getTwoFactorEnabled()));

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
        user.setMustChangePassword(true);
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
        response.setTwoFactorEnabled(Boolean.TRUE.equals(user.getTwoFactorEnabled()));

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

        PasswordValidator.validate(request.getNewPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        user.setPasswordChangedAt(java.time.LocalDateTime.now());
        userRepo.save(user);
    }

    @Override
    public void logout(String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String jti = jwtUtil.extractJti(token);
                String userEmail = securityContextService.getCurrentUser() != null
                        ? securityContextService.getCurrentUser().getEmail()
                        : "unknown";
                tokenRevocationService.revoke(
                        jti,
                        userEmail,
                        jwtUtil.extractExpiration(token).toInstant()
                                .atZone(ZoneId.of("UTC"))
                                .toLocalDateTime()
                );
            }
        } catch (Exception ignored) {
        }
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

        return getCurrentUserInfo(user);
    }
}
