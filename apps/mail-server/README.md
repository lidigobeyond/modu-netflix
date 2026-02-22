# mail-server

Haraka 기반 SMTP 수신 전용 메일 서버.   
외부에서 수신되는 이메일을 웹훅 HTTP POST로 앱에 전달합니다.

## 파일 구조

```
apps/mail-server/
  Dockerfile
  .env                         # 환경변수 (git 제외)
  .env.example                 # 환경변수 템플릿
  config/
    plugins                    # 활성화된 플러그인 목록
    smtp.ini                   # SMTP 포트 및 연결 설정
    connection.ini             # Haraka 연결 동작 설정
    me                         # 서버 호스트명
    log.ini                    # 로그 레벨
    host_list                  # 수신 허용 도메인 목록
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
  "to": ["recipient@mail.example.com"],
  "subject": "Hello",
  "rawBody": "Received: from ...\r\nSubject: Hello\r\n\r\nBody text..."
}
```

## 설정

### 환경변수

`.env.example`을 복사해 `.env`를 만들고 값을 수정한다.

```bash
cp apps/mail-server/.env.example apps/mail-server/.env
```

| 변수 | 설명 |
|------|------|
| `WEBHOOK_URL` | 수신 메일을 전달할 웹훅 엔드포인트 URL |

### 수신 도메인 추가

`config/host_list`에 한 줄씩 도메인을 추가한다.

```
mail.example.com
another-domain.com
```

### 기타 설정 파일

| 파일 | 설명 |
|------|------|
| `config/me` | SMTP 배너에 표시되는 서버 호스트명 |
| `config/smtp.ini` | 리슨 포트, 주소 설정 |
| `config/webhook_notifier.ini` | `WEBHOOK_URL` 미설정 시 사용하는 기본 URL |

## Nx 타겟

```bash
# Docker 이미지 빌드
nx run mail-server:docker-build

# 로컬 실행 (포트 25, 587)
nx run mail-server:docker-run
```

`docker-run`은 `.env` 파일을 자동으로 로드한다.

## 로컬 테스트

```bash
# 1. .env 설정
echo "WEBHOOK_URL=http://host.docker.internal:9999/webhooks/mail" > apps/mail-server/.env

# 2. 빌드 및 실행
nx run mail-server:docker-build
nx run mail-server:docker-run

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

> macOS에 `swaks`가 있다면 `swaks --to user@mail.example.com --server localhost:25` 로도 테스트 가능.

## 주의사항

- 로컬 실행 시 포트 25는 루트 권한이 필요할 수 있음 (macOS/Linux)
- 프로덕션에서는 `WEBHOOK_URL`을 `.env` 파일 대신 시크릿 관리 도구(Vault, AWS Secrets Manager 등)로 주입할 것
- TLS 설정을 하지 않으면 Haraka가 `tls_key.pem` / `tls_cert.pem` 로드 실패 경고를 출력하지만 동작에는 문제 없음
