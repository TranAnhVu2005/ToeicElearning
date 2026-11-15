# Dockerfile ở thư mục gốc của repository (Hỗ trợ khi Root Directory trên Render để trống)
# Giai đoạn 1: Build file .war thực thi bằng Maven & JDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Giai đoạn 2: Chạy ứng dụng bằng JRE 17 nhẹ
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.war app.war

EXPOSE 8080

# Giới hạn RAM cho gói Free của Render (512MB) và truyền cổng động $PORT qua shell
ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar app.war"]
