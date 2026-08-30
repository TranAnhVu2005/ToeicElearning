package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.dto.AuthResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.mapper.AuthMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.repository.UserRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.request.LoginRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.request.RegisterRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.exception.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor //Anotation tạo ra hàm xây dựng chứa tất cả các trường dữ liệu có từ khóa final
public class AuthServiceImpl implements AuthService{
    private final UserRepository userRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponseDTO register(RegisterRequest request) {
        if(userRepository.existsByUserEmail(request.getUserEmail()))
        {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if(userRepository.existsByUserNumberphone(request.getUserNumberphone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User newUser = User.builder()
                .userName(request.getUserName())
                .userEmail(request.getUserEmail())
                .userNumberphone(request.getUserNumberphone())
                .userPassword(passwordEncoder.encode(request.getUserPassword()))
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
            user = userRepository.findByUserEmail(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        }
        else {
            user = userRepository.findByUserNumberphone(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        }

        if(!passwordEncoder.matches(request.getUserPassword(), user.getUserPassword()))
        {
            throw  new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        return authMapper.toDTO(user, jwtService.generateToken(user));
    }
}
