package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto.UserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.mapper.UserMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserUpdateProfileRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDTO viewProfile(User u) {
        return userMapper.toDTO(u);
    }

    @Override
    public UserResponseDTO updateProfile(User currentUser, UserUpdateProfileRequest request) {
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
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        }
        if(passwordEncoder.matches(request.getNewUserPassword(), currentUser.getUserPassword()))
        {
            throw new AppException(ErrorCode.NEW_PASSWORD_SAME_AS_OLD);
        }
        currentUser.setUserPassword(passwordEncoder.encode(request.getNewUserPassword()));
        User updatedUser = userRepository.save(currentUser);
    }
}
