package com.ctu_cit_nienLuanNganh.toeicLearning.security;

import com.ctu_cit_nienLuanNganh.toeicLearning.common.enums.ErrorCode;
import com.ctu_cit_nienLuanNganh.toeicLearning.common.dto.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        //Lấy mã lỗi
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        // Thiết lập yêu cầu http, status là 403, dạng json và chuẩn mã hóa UTF-8
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        // Không chỉ định thì spring security trả về html hoặc plain text
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        // Giúp message tiếng việt của error code không lỗi
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.error(errorCode.getCode(), errorCode.getMessage());

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        response.flushBuffer();
    }
}
