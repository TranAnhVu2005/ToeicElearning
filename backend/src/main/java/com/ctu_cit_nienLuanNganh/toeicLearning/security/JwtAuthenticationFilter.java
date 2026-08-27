package com.ctu_cit_nienLuanNganh.toeicLearning.security;

import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.model.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.api.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        System.out.println("--------------------------------------------------");
        System.out.println("--> 1. Request URL: " + request.getRequestURI());
        System.out.println("--> 2. Header Authorization nhận được: " + authHeader);
        final String jwt;
        final String userId;

        if(authHeader == null || !authHeader.startsWith("Bearer ")){ //Mới đăng nhập chưa có token
            System.out.println("-->Header không hợp lệ hoặc không có Bearer! Cho qua filter.");
            filterChain.doFilter(request, response);
            return;
        }
        jwt = authHeader.substring(7);
        System.out.println("--> 3. Token cắt ra được: " + jwt);
        try{
            userId = jwtService.extractUserId(jwt);
            System.out.println("--> 4. UserId trích xuất từ token: " + userId);
            if(userId != null && SecurityContextHolder.getContext().getAuthentication() == null)
            {
                User user = userRepository.findById(userId).orElse(null);
                System.out.println("--> 5. Tìm user trong Database: " + (user != null ? "Tìm thấy (" + user.getUserEmail() + ")" : "Không tìm thấy user với ID này!"));
                if(user !=null && jwtService.isTokenValid(jwt, user)){
                    System.out.println("--> 6. Token hợp lệ! Tiến hành xác thực...");
                    //Tạo đối tượng user, mật khẩu là null vì xác định bằng token, ArrayList cuối là danh sách role sẽ đưa vào sau
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(user,null, new ArrayList<>());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("--> 7. Đã set Authentication thành công vào SecurityContextHolder!");
                }
                else{
                    System.out.println("--> Token không hợp lệ hoặc user null!");
                }
            }
            else
            {
                System.out.println("--> ⚠️ Điều kiện khối if không thỏa mãn (userId null hoặc SecurityContext đã có Authentication).");
            }
        } catch (Exception e) {
            System.out.println("Lỗi xác thực JWT: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
