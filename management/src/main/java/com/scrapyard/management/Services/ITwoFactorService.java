package com.scrapyard.management.Services;

import com.scrapyard.management.DTO.Response.AuthDTO.Setup2FAResponse;
import com.scrapyard.management.DTO.Response.AuthDTO.TwoFAStatusResponse;
import com.scrapyard.management.Models.User;

public interface ITwoFactorService {

    Setup2FAResponse setup(User user);

    void enable(User user, String code);

    void disable(User user, String currentPassword, String code);

    TwoFAStatusResponse getStatus(User user);

    boolean verifyCode(User user, String code);

    void verifyRequired(User user, String code);
}
