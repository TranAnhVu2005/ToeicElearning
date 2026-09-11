package com.ctu_cit_nienLuanNganh.toeicLearning.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

//Quy luật của springbooot: Mọi hàm @Bean khởi tạo đối tượng thủ công bắt buộc phải
// Được đặt bên trong một lớp được đánh dấu là @Configuration
// Khi khởi động, springboot quét qua tất cả các @Configuration và chạy @Bean bên trong, cất vào
// IoC container
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String secretKey;

    //Thêm vào IoC
    @Bean
    public Cloudinary cloudinary(){
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key",apiKey,
                "api_secret",secretKey,
                "secure",true
        ));
    }
}
