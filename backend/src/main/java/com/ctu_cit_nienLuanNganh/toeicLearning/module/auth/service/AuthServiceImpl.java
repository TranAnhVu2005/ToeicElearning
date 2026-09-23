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
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

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

    @Override
    public AuthResponseDTO loginWithGoogle(String idToken) {
        String googleVerifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> googlePayLoad;
        try{
            googlePayLoad = restTemplate.getForObject(googleVerifyUrl, Map.class); //Lấy dữ liệu từ google và trả về một map
        } catch (Exception e){
            throw new AppException(ErrorCode.UNAUTHENTICATED); //Token không hợp lệ
        }
        if(googlePayLoad==null || !googlePayLoad.containsKey("email")){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String email = (String) googlePayLoad.get("email");
        String name = (String) googlePayLoad.getOrDefault("name","Google User");
        String picture = (String) googlePayLoad.get("picture");

        Optional<User> existingUserOpt = userRepository.findByUserEmailWithRole(email);
        User user;
        if(existingUserOpt.isPresent()){
            user = existingUserOpt.get();
            if(Boolean.TRUE.equals(user.getIsLocked())){
                throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED);
            }
            if(picture!=null && (user.getUserAvatar() == null || user.getUserAvatar().isEmpty())) {
                user.setUserAvatar(picture);
                userRepository.save(user);
            }
        }
        else{
            Role defaultRole = roleRepository.findByRoleName(RoleType.ROLE_USER.name())
                    .orElseThrow(()-> new AppException(ErrorCode.ROLE_NOT_FOUND));

            User newUser = User.builder()
                    .userName(name)
                    .userEmail(email)
                    .userAvatar(picture)
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
