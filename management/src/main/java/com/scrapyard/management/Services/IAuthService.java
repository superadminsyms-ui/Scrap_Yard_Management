package com.scrapyard.management.Services;
import com.scrapyard.management.DTO.Request.AuthDTO.ChangePasswordRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.LoginRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.RegisterRequest;
import com.scrapyard.management.DTO.Request.AuthDTO.UpdateProfileRequest;
import com.scrapyard.management.DTO.Response.AuthDTO.LoginResponse;
import com.scrapyard.management.DTO.Response.AuthDTO.RegisterResponse;
import com.scrapyard.management.DTO.Response.AuthDTO.UserInfoResponse;
import com.scrapyard.management.Models.User;

public interface IAuthService {

    LoginResponse login(LoginRequest request);
    LoginResponse complete2FALogin(String tempToken, String code);
    RegisterResponse register(RegisterRequest request, User currentUser);
    UserInfoResponse getCurrentUserInfo(User user);
    void changePassword(ChangePasswordRequest request, User user);
    UserInfoResponse updateProfile(UpdateProfileRequest request, User user);
    void logout(String authHeader);



}
