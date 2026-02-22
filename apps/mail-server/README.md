# mail-server

Haraka 기반 SMTP 수신 전용 메일 서버.   
외부에서 수신되는 이메일을 웹훅 HTTP POST로 앱에 전달합니다.

## 파일 구조

```
apps/mail-server/
  Dockerfile
  docker-entrypoint.sh         # 환경변수로 config 파일 덮어쓰고 Haraka 실행
  config/
    plugins                    # 활성화된 플러그인 목록
    smtp.ini                   # SMTP 포트 및 연결 설정
    connection.ini             # Haraka 연결 동작 설정
    me                         # 서버 호스트명 (기본값)
    log.ini                    # 로그 레벨
    host_list                  # 수신 허용 도메인 목록 (기본값)
    webhook_notifier.ini       # 웹훅 URL 기본값
  plugins/
    webhook_notifier.js        # 수신 메일을 웹훅으로 전달하는 커스텀 플러그인
```

## 웹훅 플러그인 동작

1. Haraka가 메일 데이터를 모두 수신하면 `data_post` 훅에서 본문을 읽어 `transaction.notes`에 저장
2. `queue` 훅에서 `from`, `to`, `subject`, `rawBody`를 JSON으로 구성해 웹훅 URL로 HTTP POST
3. 전송 성공/실패 여부와 무관하게 메일 수신은 항상 허용 (best-effort)

### 웹훅 페이로드

```json
{
  "from": "sender@example.com",
  "to": ["recipient@example.com"],
  "subject": "Hello",
  "rawBody": "Received: from ...\r\nSubject: Hello\r\n\r\nBody text..."
}
```

## 환경변수

| 변수 | 설명 |
|------|------|
| `WEBHOOK_URL` | 수신 메일을 전달할 웹훅 엔드포인트 URL |
| `SMTP_HOSTNAME` | 서버 호스트명. `config/me`를 덮어씀 |
| `SMTP_HOST_LIST` | 수신 허용 도메인 목록 (콤마 구분). `config/host_list`를 덮어씀 |

## 로컬 테스트

```bash
# 1. 빌드
docker build -t mail-server apps/mail-server/

# 2. 실행
docker run --rm -p 25:25 \
  -e WEBHOOK_URL=http://host.docker.internal:3000/mail \
  -e SMTP_HOSTNAME=mail.example.com \
  mail-server

# 3. 테스트 메일 발송 (Python)
python3 -c "
import smtplib
from email.mime.text import MIMEText

msg = MIMEText('Test body')
msg['Subject'] = 'Test'
msg['From'] = 'sender@test.local'
msg['To'] = 'user@mail.example.com'

with smtplib.SMTP('localhost', 25, timeout=10) as s:
    s.sendmail('sender@test.local', ['user@mail.example.com'], msg.as_string())
    print('Sent')
"
```

## 주의사항

- 로컬 실행 시 포트 25는 루트 권한이 필요할 수 있음 (macOS/Linux)
- TLS 설정을 하지 않으면 Haraka가 `tls_key.pem` / `tls_cert.pem` 로드 실패 경고를 출력하지만 동작에는 문제 없음
