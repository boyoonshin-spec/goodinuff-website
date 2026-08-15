# 나의 하루

일정 관리 · 할일 · 일기를 한 곳에서 기록하는 개인용 웹앱입니다. 타자와 음성으로
빠르게 기록하고, 카카오톡 '나에게 보내기'로 일정 알림을 받을 수 있습니다.

## 주요 기능

- **로그인 기반 저장**: 이메일/비밀번호로 로그인하면 여러 기기에서 같은 데이터를 볼 수 있어요.
- **일정 관리**: 날짜별로 일정과 할일을 함께 계획.
- **할일**: 지난 할일 / 오늘 / 예정으로 모아보는 통합 할일 목록.
- **일기**: 날짜별 일기, 기분 이모지, 지난 기록 모아보기.
- **음성 입력**: 제목·메모·일기 입력창의 마이크 버튼으로 말해서 기록 (브라우저 음성 인식, Chrome 권장).
- **카카오톡 알림**: 일정에 알림을 켜두면 지정한 시간 전에 카카오톡 '나에게 보내기'로 알림 발송.

## 기술 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · NextAuth (Credentials)

## 시작하기

```bash
npm install
cp .env.example .env   # 값 채우기 (아래 참고)
npx prisma migrate dev
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 회원가입 후 사용하세요.

## 환경변수 (.env)

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | SQLite 파일 경로 (기본값 그대로 사용 가능) |
| `AUTH_SECRET` | 로그인 세션 암호화 키. `openssl rand -base64 32` 로 생성 |
| `KAKAO_REST_API_KEY` | 카카오 개발자 콘솔의 REST API 키 |
| `KAKAO_CLIENT_SECRET` | (선택) 카카오 로그인 보안 강화 설정 시 필요 |
| `KAKAO_REDIRECT_URI` | 카카오 로그인 Redirect URI (아래 참고) |
| `NEXT_PUBLIC_APP_URL` | 배포 주소. 카카오톡 알림 메시지의 링크로 사용됨 |
| `CRON_SECRET` | `/api/cron/send-reminders` 호출 시 필요한 임의의 비밀 값 |

### 카카오톡 알림 연동 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com)에서 애플리케이션을 새로 만들고 **REST API 키**를 `KAKAO_REST_API_KEY`에 입력합니다.
2. **제품 설정 → 카카오 로그인**을 활성화하고, **Redirect URI**에 `{NEXT_PUBLIC_APP_URL}/api/kakao/callback` 을 등록합니다 (로컬 개발 시 `http://localhost:3000/api/kakao/callback`).
3. **카카오 로그인 → 동의항목**에서 "카카오톡 메시지 전송"(`talk_message`)을 활성화합니다.
4. 앱이 아직 "검수/출시" 전(개발 단계)이라면, **앱 설정 → 팀 관리**에서 사용할 카카오 계정을 팀원으로 추가해야 해당 계정으로 로그인 및 알림 발송이 가능합니다.
5. 앱의 **설정** 페이지에서 "카카오톡 연동하기"를 눌러 로그인하면 연동이 완료됩니다.

### 알림 발송 스케줄러

일정 알림은 저절로 발송되지 않고, 주기적으로 `/api/cron/send-reminders` 를
호출해줘야 발송됩니다 (예: 5분마다). 배포 환경에 맞는 스케줄러(예: Vercel Cron,
외부 cron 서비스 등)에서 아래와 같이 호출하도록 설정하세요.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/send-reminders
```

Vercel을 사용한다면 `vercel.json`에 아래처럼 등록할 수 있습니다.

```json
{
  "crons": [
    { "path": "/api/cron/send-reminders", "schedule": "*/5 * * * *" }
  ]
}
```
(Vercel Cron은 요청 시 자동으로 인증 헤더를 보내지 않으므로, 라우트를 살짝 바꾸거나
외부 cron 서비스를 함께 쓰는 것이 더 간단할 수 있습니다.)

## 음성 입력에 대해

브라우저 내장 Web Speech API를 사용하며 별도 API 키가 필요 없습니다. Chrome,
Edge 등 최신 브라우저에서 지원되며, 마이크 접근 권한이 필요합니다.
