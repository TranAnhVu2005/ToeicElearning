package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto.UserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.mapper.UserMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserUpdateProfileRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import jakarta.transaction.Transactional;
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
        User user = userRepository.findByIdWithRole(u.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateProfile(User currentUser, UserUpdateProfileRequest request) {
        User user = userRepository.findByIdWithRole(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(request.getUserName() != null)
        {
            user.setUserName(request.getUserName());
        }
        if(request.getUserEmail() != null && !request.getUserEmail().isBlank())
        {
            String newEmail = request.getUserEmail().trim().toLowerCase();
            if(!newEmail.equalsIgnoreCase(user.getUserEmail()))
            {
                if(userRepository.existsByUserEmail(newEmail))
                {
                    throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
                }
                user.setUserEmail(newEmail);
            }
        }
        if(request.getUserNumberphone() != null && !request.getUserNumberphone().isBlank())
        {
            String newNumberphone = request.getUserNumberphone().trim();
            if(!newNumberphone.equals(user.getUserNumberphone()))
            {
                if(userRepository.existsByUserNumberphone(newNumberphone))
                {
                    throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
                }
                user.setUserNumberphone(newNumberphone);
            }
        }
        if(request.getUserAvatar() != null)
        {
            user.setUserAvatar(request.getUserAvatar());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(User currentUser, UserChangePasswordRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(!passwordEncoder.matches(request.getOldUserPassword(), user.getUserPassword()))
        {
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        }
        if(passwordEncoder.matches(request.getNewUserPassword(), user.getUserPassword()))
        {
            throw new AppException(ErrorCode.NEW_PASSWORD_SAME_AS_OLD);
        }
        user.setUserPassword(passwordEncoder.encode(request.getNewUserPassword()));
        userRepository.save(user);
    }
}
