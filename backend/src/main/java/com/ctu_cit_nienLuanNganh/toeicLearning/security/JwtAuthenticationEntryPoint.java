package com.ctu_cit_nienLuanNganh.toeicLearning.security;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import org.springframework.security.core.AuthenticationException;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper;

    @Override
    // Trả về void và không xử lý được như trong các controller trả về Response Entiry
    // Vì lỗi 401 nằm ngoài cùng của ứng dụng, không có sự hỗ trợ của spring mvc
    // Không tự chuyển từ object thành json được
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
    throws IOException, ServletException {
        //Lấy mã lỗi
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        // Thiết lập yêu cầu http, status là 401, dạng json và chuẩn mã hóa UTF-8
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // Không chỉ định thì spring security trả về html hoặc plain text
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        // Giúp message tiếng việt của error code không lỗi
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.error(errorCode.getCode(), errorCode.getMessage());

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        response.flushBuffer();
    }
}
