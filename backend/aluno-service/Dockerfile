FROM gradle:8.7-jdk17-alpine AS builder
WORKDIR /app
ENV GRADLE_OPTS="-Dorg.gradle.jvmargs='-Xmx256m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC' -Dorg.gradle.daemon=false"
COPY . .
RUN gradle bootJar --no-daemon -q -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV JAVA_OPTS="-Xmx192m -Xms64m -XX:+UseSerialGC"
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
