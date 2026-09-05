package com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.service;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageParams;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.PageResponse;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.exception.AppException;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.dto.AdminResponseDTO;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.mapper.AdminMapper;
import com.ctu_cit_nienLuanNganh.toeicLearning.module.admin.request.LockUserRequest;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService{
    private final UserRepository userRepository;
    private final AdminMapper adminMapper;

    @Override
    public PageResponse<AdminResponseDTO> getAllUsers(PageParams pageParams) {
        Page<User> userPage = userRepository.findAllUsersWithRole(pageParams.getKeyWord(), pageParams.toPageable()); // Trả về request của client
        Page<AdminResponseDTO> dtoPage = userPage.map(adminMapper::toDTO);
        // Tương đương Page<AdminResponseDTO> dtoPage = userPage.map(user -> adminMapper.toDTO(user));
        return PageResponse.of(dtoPage);
    }

    @Override
    public AdminResponseDTO lockUser(User currentUser, LockUserRequest request) {
        User targetUser = userRepository.findByIdWithRole(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new AppException(ErrorCode.CANNOT_LOCK_CURRENT_USER);
        }
        targetUser.setIsLocked(request.isLocked());
        User savedUser = userRepository.save(targetUser);
        return adminMapper.toDTO(savedUser);
    }
}
