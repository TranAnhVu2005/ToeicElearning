package com.ctu_cit_nienLuanNganh.toeicLearning.module.user.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.CloudinaryService;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.service.AuditEventService;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.dto.UserResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.mapper.UserMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserChangePasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.SetLocalPasswordRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.user.request.UserUpdateProfileRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service.GoogleIdTokenVerifier;
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
    private final AuditEventService auditEventService;
    private final CloudinaryService cloudinaryService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;


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
        String previousAvatarUrl = null;

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

        if(request.getFile()!=null && !request.getFile().isEmpty()){ // Thêm !isEmpty() vì có thể file không gửi lên nhưng nó vẫn gửi dưới dạng byte 0
            previousAvatarUrl = user.getUserAvatar();
            String newAvatarUrl = cloudinaryService.uploadFile(request.getFile(),"Resource/toeic-learning/avatars");
            user.setUserAvatar(newAvatarUrl);
        }


        User updatedUser = userRepository.save(user);
        if (previousAvatarUrl != null && !previousAvatarUrl.isBlank()) {
            cloudinaryService.deleteFileByUrl(previousAvatarUrl);
        }
        return userMapper.toDTO(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(User currentUser, UserChangePasswordRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getUserPassword() == null || user.getUserPassword().isBlank()) {
            throw new AppException(ErrorCode.LOCAL_PASSWORD_NOT_SET);
        }
        if(!passwordEncoder.matches(request.getOldUserPassword(), user.getUserPassword()))
        {
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        }
        if(passwordEncoder.matches(request.getNewUserPassword(), user.getUserPassword()))
        {
            throw new AppException(ErrorCode.NEW_PASSWORD_SAME_AS_OLD);
        }
        user.setUserPassword(passwordEncoder.encode(request.getNewUserPassword()));
        user.setAuthVersion((user.getAuthVersion() == null ? 0 : user.getAuthVersion()) + 1);
        userRepository.save(user);
        auditEventService.record(user, "PASSWORD_CHANGED", "USER", user.getId(), "credentialChanged=true");
    }

    @Override
    @Transactional
    public void setLocalPassword(User currentUser, SetLocalPasswordRequest request) {
        User user = userRepository.findByIdWithRoleForUpdate(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (Boolean.TRUE.equals(user.getIsLocked())) throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);
        if (user.getGoogleSub() == null || user.getGoogleSub().isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (user.getUserPassword() != null && !user.getUserPassword().isBlank()) {
            throw new AppException(ErrorCode.LOCAL_PASSWORD_ALREADY_SET);
        }

        GoogleIdTokenVerifier.VerifiedGoogleIdentity identity = googleIdTokenVerifier.verifyRecent(request.getGoogleIdToken());
        if (!user.getGoogleSub().equals(identity.subject())) throw new AppException(ErrorCode.UNAUTHENTICATED);

        user.setUserPassword(passwordEncoder.encode(request.getNewUserPassword()));
        user.setAuthVersion((user.getAuthVersion() == null ? 0 : user.getAuthVersion()) + 1);
        userRepository.save(user);
        auditEventService.record(user, "LOCAL_PASSWORD_SET", "USER", user.getId(), "credentialChanged=true");
    }
}
