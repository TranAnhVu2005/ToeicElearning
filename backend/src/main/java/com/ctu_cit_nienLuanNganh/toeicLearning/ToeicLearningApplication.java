package com.ctu_cit_nienLuanNganh.toeicLearning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.ZoneId;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class ToeicLearningApplication {

	public static void main(String[] args) {
		SpringApplication application = new SpringApplication(ToeicLearningApplication.class);
		application.addInitializers(context -> {
			String businessTimeZone = context.getEnvironment()
					.getProperty("app.business-time-zone", "Asia/Ho_Chi_Minh");
			TimeZone.setDefault(TimeZone.getTimeZone(ZoneId.of(businessTimeZone)));
		});
		application.run(args);
		System.out.println("Hello World");
	}

}
