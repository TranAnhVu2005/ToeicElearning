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
        final String jwt;
        final String userId;

        if(authHeader == null || !authHeader.startsWith("Bearer ")){ //Mới đăng nhập chưa có token
            filterChain.doFilter(request, response);
            return;
        }
        jwt = authHeader.substring(7);
        try{
            userId = jwtService.extractUserId(jwt);
            if(userId != null && SecurityContextHolder.getContext().getAuthentication() == null)
            {
                User user = userRepository.findById(userId).orElse(null);
                if(user !=null && jwtService.isTokenValid(jwt, user)){
                    //Tạo đối tượng user, mật khẩu là null vì xác định bằng token, ArrayList cuối là danh sách role sẽ đưa vào sau
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(user,null, new ArrayList<>());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        filterChain.doFilter(request, response);
    }
}
