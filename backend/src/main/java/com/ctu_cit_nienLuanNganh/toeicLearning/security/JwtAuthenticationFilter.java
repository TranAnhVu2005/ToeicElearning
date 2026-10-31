package com.ctu_cit_nienLuanNganh.toeicLearning.security;

import com.ctu_cit_nienLuanNganh.toeicLearning.entity.Role;
import com.ctu_cit_nienLuanNganh.toeicLearning.entity.User;
import com.ctu_cit_nienLuanNganh.toeicLearning.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        try {
            String userId = jwtService.extractUserId(token);
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = userRepository.findByIdWithRole(userId).orElse(null);
                if (user != null && jwtService.isTokenValid(token, user)) {
                    if (Boolean.TRUE.equals(user.getIsLocked())) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write("{\"code\":2009,\"message\":\"Tài khoản của bạn đã bị khóa.\"}");
                        return;
                    }

                    Role role = user.getRole();
                    String authority = role != null && role.getRoleName() != null
                            ? role.getRoleName() : "ROLE_USER";
                    if (!authority.startsWith("ROLE_")) {
                        authority = "ROLE_" + authority;
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user, null, Collections.singletonList(new SimpleGrantedAuthority(authority)));
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (RuntimeException ignored) {
            // Invalid/expired bearer tokens remain unauthenticated. Never log token or parser details.
        }

        filterChain.doFilter(request, response);
    }
}
