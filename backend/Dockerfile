# Giai đoạn 1: Build file .war thực thi bằng Maven & JDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Tải trước dependencies để tận dụng Docker layer cache trên Render
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy mã nguồn và đóng gói
COPY src ./src
RUN mvn clean package -DskipTests -B

# Giai đoạn 2: Chạy ứng dụng bằng JRE 17 nhẹ
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Dự án dùng <packaging>war</packaging> kèm spring-boot-maven-plugin nên tạo ra file .war thực thi
COPY --from=build /app/target/*.war app.war

EXPOSE 8080

# Giới hạn RAM cho gói Free của Render (512MB) và truyền cổng động $PORT qua shell
ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar app.war"]
