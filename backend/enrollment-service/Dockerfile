FROM gradle:8.7-jdk17 AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon -q || true
COPY src src
RUN gradle bootJar --no-daemon -q -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseG1GC"
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
