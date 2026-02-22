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

# SMTP 포트 노출
# 25  - 표준 SMTP (서버 간 메일 전송)
# 587 - SMTP Submission (클라이언트 → 서버)
EXPOSE 25 587

# Haraka를 /app 디렉토리를 설정 루트로 실행
CMD ["haraka", "-c", "/app"]
