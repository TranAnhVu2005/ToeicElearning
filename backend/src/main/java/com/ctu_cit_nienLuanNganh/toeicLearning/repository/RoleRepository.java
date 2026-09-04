package com.ctu_cit_nienLuanNganh.toeicLearning.repository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.base.BaseRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Role;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends BaseRepository<Role, String> {
    Optional<Role> findByRoleName(String roleName);
}
