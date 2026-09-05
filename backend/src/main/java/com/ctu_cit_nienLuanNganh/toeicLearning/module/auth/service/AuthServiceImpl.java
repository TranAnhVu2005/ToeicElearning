package com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.RoleType;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Role;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.dto.AuthResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.mapper.AuthMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.RoleRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.request.LoginRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.auth.request.RegisterRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor //Anotation tạo ra hàm xây dựng chứa tất cả các trường dữ liệu có từ khóa final
public class AuthServiceImpl implements AuthService{
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequest request) {
        if(userRepository.existsByUserEmail(request.getUserEmail()))
        {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if(userRepository.existsByUserNumberphone(request.getUserNumberphone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        // Dùng biểu thức lamda ở orElseThrow, nếu không có dữ liệu trong db thì mới tạo hàm này
        Role defaultRole = roleRepository.findByRoleName(RoleType.ROLE_USER.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        User newUser = User.builder()
                .userName(request.getUserName())
                .userEmail(request.getUserEmail())
                .userNumberphone(request.getUserNumberphone())
                .userPassword(passwordEncoder.encode(request.getUserPassword()))
                .role(defaultRole)
                .isLocked(false)
                .build();
        User savedUser = userRepository.save(newUser);
        return authMapper.toDTO(savedUser, jwtService.generateToken(savedUser));
    }

    @Override
    public AuthResponseDTO login(LoginRequest request) {
        String identifier = request.getEmailOrPhone();
        User user;

        if(identifier.contains("@"))
        {
            user = userRepository.findByUserEmailWithRole(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        }
        else {
            user = userRepository.findByUserNumberPhoneWithRole(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        }

        if(Boolean.TRUE.equals(user.getIsLocked()))
        {
            throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);
        }

        if(!passwordEncoder.matches(request.getUserPassword(), user.getUserPassword()))
        {
            throw  new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        return authMapper.toDTO(user, jwtService.generateToken(user));
    }
}
