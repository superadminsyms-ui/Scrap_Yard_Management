package com.scrapyard.management.Services;

import com.scrapyard.management.DTO.Request.AuthDTO.UserUpdateRequest;
import com.scrapyard.management.DTO.Response.AuthDTO.UserListResponse;
import com.scrapyard.management.Models.User;

import java.util.List;

public interface IUserService {

    List<UserListResponse> listAll(User currentUser);

    UserListResponse getById(Long id, User currentUser);

    UserListResponse updateUser(Long id, UserUpdateRequest request, User currentUser);

    UserListResponse activateUser(Long id, User currentUser);

    UserListResponse deactivateUser(Long id, User currentUser);
}
