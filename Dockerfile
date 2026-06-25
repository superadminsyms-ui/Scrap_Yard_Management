# syntax=docker/dockerfile:1

############################
# Stage 1: build frontend (Vite SPA)
############################
FROM node:20-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

############################
# Stage 2: build backend jar (embeds frontend dist into static/)
############################
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY management/pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY management/src ./src
COPY --from=web /web/dist ./src/main/resources/static
RUN mvn -B -q clean package -DskipTests

############################
# Stage 3: runtime (single service serves API + SPA on same origin)
############################
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
