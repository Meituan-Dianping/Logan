# 参考: https://developer.aliyun.com/article/65274
FROM registry.cn-hangzhou.aliyuncs.com/acs/maven:3-jdk-8 AS build-env

ENV MY_HOME=/app
RUN mkdir -p $MY_HOME
WORKDIR $MY_HOME
ADD pom.xml $MY_HOME

# get all the downloads out of the way
RUN ["/usr/local/bin/mvn-entrypoint.sh","mvn","verify","clean","--fail-never"]

# add source
ADD . $MY_HOME

# run maven verify
RUN ["/usr/local/bin/mvn-entrypoint.sh","mvn","verify"]

# Second stage - build image
FROM tomcat:7.0.61-jre8

COPY --from=build-env /app/target/*.war /usr/local/tomcat/webapps/logan-web.war

ENV JAVA_OPTS=""
ENV SERVER_PORT 8080

EXPOSE ${SERVER_PORT}