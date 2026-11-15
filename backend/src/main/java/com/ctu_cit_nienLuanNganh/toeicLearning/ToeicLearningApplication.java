package com.ctu_cit_nienLuanNganh.toeicLearning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.MapPropertySource;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class ToeicLearningApplication {

	public static void main(String[] args) {
		SpringApplication application = new SpringApplication(ToeicLearningApplication.class);
		application.addInitializers(context -> {
			loadDotEnvIfPresent(context.getEnvironment());
			String businessTimeZone = context.getEnvironment()
					.getProperty("app.business-time-zone", "Asia/Ho_Chi_Minh");
			TimeZone.setDefault(TimeZone.getTimeZone(ZoneId.of(businessTimeZone)));
		});
		application.run(args);
		System.out.println("Hello World");
	}

	private static void loadDotEnvIfPresent(org.springframework.core.env.ConfigurableEnvironment environment) {
		Map<String, Object> dotenvProps = new LinkedHashMap<>();
		List<Path> candidates = List.of(
				Paths.get(".env"),
				Paths.get("backend", ".env")
		);
		for (Path candidate : candidates) {
			if (!Files.isRegularFile(candidate)) {
				continue;
			}
			try {
				List<String> lines = Files.readAllLines(candidate, StandardCharsets.UTF_8);
				for (String rawLine : lines) {
					String line = rawLine == null ? "" : rawLine.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int eqIndex = line.indexOf('=');
					if (eqIndex <= 0) {
						continue;
					}
					String key = line.substring(0, eqIndex).trim();
					String value = line.substring(eqIndex + 1).trim();
					if ((value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2)
							|| (value.startsWith("'") && value.endsWith("'") && value.length() >= 2)) {
						value = value.substring(1, value.length() - 1).trim();
					}
					if (key.isEmpty()
							|| value.isEmpty()
							|| "SPRING_PROFILES_ACTIVE".equalsIgnoreCase(key)
							|| value.contains("your-frontend-domain.example")) {
						continue;
					}
					String existingEnv = System.getenv(key);
					if (existingEnv == null || existingEnv.isBlank()) {
						dotenvProps.put(key, value);
					}
				}
			} catch (IOException ignored) {
				// Ignore unreadable .env file and continue startup
			}
		}
		if (!dotenvProps.isEmpty()) {
			environment.getPropertySources().addLast(new MapPropertySource("localDotEnv", dotenvProps));
		}
	}

}
