package com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.repository;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
}
