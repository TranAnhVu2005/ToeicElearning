package com.ctu_cit_nienLuanNganh.toeicLearning.security;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Role;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.RoleRepository;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        log.info("--------------------------------------------------");
        log.info("--> 1. Request URL: " + request.getRequestURI());
        log.info("--> 2. Header Authorization nhận được: " + authHeader);
        final String jwt;
        final String userId;

        if(authHeader == null || !authHeader.startsWith("Bearer ")){ //Mới đăng nhập chưa có token
            log.info("-->Header không hợp lệ hoặc không có Bearer! Cho qua filter.");
            filterChain.doFilter(request, response);
            return;
        }
        jwt = authHeader.substring(7);
        log.info("--> 3. Token cắt ra được: " + jwt);
        try{
            userId = jwtService.extractUserId(jwt);
            log.info("--> 4. Use    rId trích xuất từ token: " + userId);
            if(userId != null && SecurityContextHolder.getContext().getAuthentication() == null)
            {
                User user = userRepository.findByIdWithRole(userId).orElse(null);
                log.info("--> 5. Tìm user trong Database: " + (user != null ? "Tìm thấy (" + user.getUserEmail() + ")" : "Không tìm thấy user với ID này!"));
                if(user !=null && jwtService.isTokenValid(jwt, user)){
                    if(Boolean.TRUE.equals(user.getIsLocked()))
                    {
                        log.warn("Tài khoản {} đã bị khóa, từ chối request", user.getUserEmail());
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write("{\"error\": \"Tài khoản của bạn đã bị khóa.\"}");
                        return;
                    }
                    log.info("--> 6. Token hợp lệ! Tiến hành xác thực...");

                    // ROLE_Vaitro là quy chuẩn nhận diện của spring security
                    String roleName = "ROLE_USER";
                    if(user.getRole() != null && user.getRole().getId() != null)
                    {
                        Role role = user.getRole();
                        if(role !=null && role.getRoleName() !=null)
                        {
                            roleName = role.getRoleName();
                        }
                        if(!roleName.startsWith("ROLE_"))
                        {
                            roleName = "ROLE_" + roleName;
                        }
                    }

                    // Tạo danh sách 1 phần tử vì srping security cần thêm vào một ds, nó bao
                    // quát cho trường hợp người dùng có nhiều quyền khác nhau
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));
                    log.info("-->User {} được gán Role: {}", user.getUserEmail(), roleName);

                    //Tạo đối tượng user, mật khẩu là null vì xác định bằng token, ArrayList cuối là danh sách role sẽ đưa vào sau
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("--> 7. Đã set Authentication thành công vào SecurityContextHolder!");
                }
                else{
                    log.info("--> Token không hợp lệ hoặc user null!");
                }
            }
            else
            {
                log.info("--> Điều kiện khối if không thỏa mãn (userId null hoặc SecurityContext đã có Authentication).");
            }
        } catch (Exception e) {
            log.error("Lỗi xác thực JWT: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
