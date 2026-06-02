## Build stage
FROM maven:3.9-eclipse-temurin-11 AS build
WORKDIR /app

COPY pom.xml ./
COPY src ./src

RUN mvn -q -DskipTests package

## Run stage
FROM eclipse-temurin:11-jre
WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar /app/app.jar"]

