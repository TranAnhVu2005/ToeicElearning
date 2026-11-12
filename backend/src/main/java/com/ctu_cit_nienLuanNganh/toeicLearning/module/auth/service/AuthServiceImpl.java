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

import java.util.Optional;

@Service
@RequiredArgsConstructor //Anotation tạo ra hàm xây dựng chứa tất cả các trường dữ liệu có từ khóa final
public class AuthServiceImpl implements AuthService{
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequest request) {
        String normalizedName = request.getUserName() == null ? "" : request.getUserName().trim();
        String normalizedEmail = request.getUserEmail() == null ? "" : request.getUserEmail().trim().toLowerCase(java.util.Locale.ROOT);
        String normalizedPhone = request.getUserNumberphone() == null ? "" : request.getUserNumberphone().trim();
        if (normalizedName.isBlank() || normalizedEmail.isBlank() || normalizedPhone.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if(userRepository.existsByUserEmail(normalizedEmail))
        {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if(userRepository.existsByUserNumberphone(normalizedPhone)) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        // Dùng biểu thức lamda ở orElseThrow, nếu không có dữ liệu trong db thì mới tạo hàm này
        Role defaultRole = roleRepository.findByRoleName(RoleType.ROLE_USER.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        User newUser = User.builder()
                .userName(normalizedName)
                .userEmail(normalizedEmail)
                .userNumberphone(normalizedPhone)
                .userPassword(passwordEncoder.encode(request.getUserPassword()))
                .authProvider("LOCAL")
                .role(defaultRole)
                .isLocked(false)
                .currentStreak(0)
                .highestStreak(0)
                .totalScore(0)
                .build();
        User savedUser = userRepository.save(newUser);
        return authMapper.toDTO(savedUser, jwtService.generateToken(savedUser));
    }

    @Override
    public AuthResponseDTO login(LoginRequest request) {
        String identifier = request.getEmailOrPhone() == null ? "" : request.getEmailOrPhone().trim();
        User user;

        if(identifier.contains("@"))
        {
            user = userRepository.findByUserEmailWithRole(identifier.toLowerCase(java.util.Locale.ROOT))
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        }
        else {
            user = userRepository.findByUserNumberPhoneWithRole(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        }

        if (Boolean.TRUE.equals(user.getIsLocked()) || user.getUserPassword() == null
                || !passwordEncoder.matches(request.getUserPassword(), user.getUserPassword()))
        {
            // Keep the response identical for wrong credentials and locked accounts.
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        return authMapper.toDTO(user, jwtService.generateToken(user));
    }

    @Override
    @Transactional
    public AuthResponseDTO loginWithGoogle(String idToken) {
        GoogleIdTokenVerifier.VerifiedGoogleIdentity identity = googleIdTokenVerifier.verify(idToken);
        Optional<User> existingUserOpt = userRepository.findByGoogleSubWithRole(identity.subject());
        boolean matchedByGoogleSubject = existingUserOpt.isPresent();
        if (existingUserOpt.isEmpty()) {
            existingUserOpt = userRepository.findByUserEmailWithRole(identity.email());
        }
        User user;
        if(existingUserOpt.isPresent()){
            user = existingUserOpt.get();
            if(Boolean.TRUE.equals(user.getIsLocked())){
                throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);
            }
            if (user.getGoogleSub() != null && !user.getGoogleSub().equals(identity.subject())) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            if (!matchedByGoogleSubject && user.getGoogleSub() == null
                    && !"GOOGLE".equalsIgnoreCase(user.getAuthProvider())) {
                // Do not silently link a Google identity to an existing local account by email alone.
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            user.setGoogleSub(identity.subject());
            if(identity.picture()!=null && (user.getUserAvatar() == null || user.getUserAvatar().isEmpty())) {
                user.setUserAvatar(identity.picture());
            }
            userRepository.save(user);
        }
        else{
            Role defaultRole = roleRepository.findByRoleName(RoleType.ROLE_USER.name())
                    .orElseThrow(()-> new AppException(ErrorCode.ROLE_NOT_FOUND));

            User newUser = User.builder()
                    .userName(identity.name())
                    .userEmail(identity.email())
                    .userAvatar(identity.picture())
                    .googleSub(identity.subject())
                    .authProvider("GOOGLE")
                    .role(defaultRole)
                    .isLocked(false)
                    .currentStreak(0)
                    .highestStreak(0)
                    .totalScore(0)
                    .build();
            user = userRepository.save(newUser);
        }
        String appAccessToken = jwtService.generateToken(user);
        return authMapper.toDTO(user, appAccessToken);
    }
}
