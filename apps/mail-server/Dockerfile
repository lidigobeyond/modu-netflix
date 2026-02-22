# Haraka SMTP 수신 전용 메일 서버
# 외부에서 수신된 이메일을 웹훅으로 앱에 전달한다.

# Node.js 20 Alpine 기반 경량 이미지 사용
FROM node:20-alpine

# Haraka SMTP 서버를 전역으로 설치
RUN npm install -g Haraka

# 작업 디렉토리 설정
WORKDIR /app

# Haraka 설정 파일 복사 (smtp.ini, plugins, me, log.ini, webhook_notifier.ini)
COPY config/ config/

# 커스텀 플러그인 복사 (webhook_notifier.js)
COPY plugins/ plugins/

# 엔트리포인트 스크립트 복사
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# SMTP 포트 노출
EXPOSE 25

# 엔트리포인트에서 환경변수로 config 파일 덮어쓴 후 Haraka 실행
ENTRYPOINT ["/docker-entrypoint.sh"]
