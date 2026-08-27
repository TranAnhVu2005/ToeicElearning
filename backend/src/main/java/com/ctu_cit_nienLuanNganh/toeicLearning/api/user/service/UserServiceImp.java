package com.ctu_cit_nienLuanNganh.toeicLearning.api.user.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.repository.UserRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.dto.UserResponeDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.mapper.UserMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.user.request.UserUpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImp implements UserService{
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponeDTO viewProfile(User u) {
        return userMapper.toDTO(u);
    }

    @Override
    public UserResponeDTO updateProfile(User currentUser, UserUpdateProfileRequest request) {
        if(request.getUserName() != null)
        {
            currentUser.setUserName(request.getUserName());
        }
        if(request.getUserEmail() != null)
        {
            currentUser.setUserEmail(request.getUserEmail());
        } if(request.getUserNumberphone() != null)
        {
            currentUser.setUserNumberphone(request.getUserNumberphone());
        }
        if(request.getUserAvatar() != null)
        {
            currentUser.setUserAvatar(request.getUserAvatar());
        }

        User updatedUser = userRepository.save(currentUser);
        return userMapper.toDTO(updatedUser);
    }

    @Override
    public void changePassword(User currentUser, UserChangePasswordRequest request) {
        if(!passwordEncoder.matches(request.getOldUserPassword(), currentUser.getUserPassword()))
        {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }
        if(passwordEncoder.matches(request.getNewUserPassword(), currentUser.getUserPassword()))
        {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu cũ");
        }
        currentUser.setUserPassword(passwordEncoder.encode(request.getNewUserPassword()));
        User updatedUser = userRepository.save(currentUser);
    }
}
