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

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma (SQLite/Turso via libSQL) · NextAuth (Credentials)

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
| `DATABASE_URL` | 로컬 개발은 SQLite 파일 경로(기본값 그대로 사용). 배포 시엔 Turso 주소(`libsql://...`)로 교체 |
| `DATABASE_AUTH_TOKEN` | Turso 사용 시 필요한 인증 토큰 (로컬 개발은 비워둬도 됨) |
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

이 저장소에는 이미 `vercel.json`이 있어서, Vercel에 배포하면 5분마다 자동 호출됩니다.
Vercel은 `CRON_SECRET` 환경변수가 설정되어 있으면 자체 Cron 요청에 자동으로
`Authorization: Bearer $CRON_SECRET` 헤더를 붙여서 보내주므로 별도 설정이 필요 없습니다.

## 배포하기 (Vercel + Turso)

로컬 SQLite 파일은 서버리스 환경(Vercel)에서 요청마다 초기화될 수 있어 데이터가
유지되지 않습니다. 그래서 배포 시에는 SQLite와 호환되는 무료 클라우드 DB인
[Turso](https://turso.tech)를 사용합니다.

### 1. Turso 데이터베이스 만들기

1. [turso.tech](https://turso.tech) 에서 무료 계정 생성 (GitHub 계정으로 가능)
2. 대시보드에서 새 데이터베이스 생성
3. 생성된 DB의 **연결 주소**(`libsql://xxx.turso.io`)와 **Auth Token**을 발급받아 각각
   `DATABASE_URL`, `DATABASE_AUTH_TOKEN`으로 사용

### 2. 마이그레이션 적용

로컬에서 아래처럼 Turso DB에 스키마를 적용합니다 (최초 1회 + 스키마 변경 시마다).

```bash
DATABASE_URL="libsql://xxx.turso.io" DATABASE_AUTH_TOKEN="..." npx prisma migrate deploy
```

### 3. Vercel에 배포

1. [vercel.com](https://vercel.com) 에서 무료 계정 생성 (GitHub 계정으로 가능)
2. "Add New → Project"에서 이 GitHub 저장소를 선택해 Import
3. 프로젝트 **Settings → Environment Variables**에 아래 값을 모두 등록:
   - `DATABASE_URL`, `DATABASE_AUTH_TOKEN` (Turso 값)
   - `AUTH_SECRET`
   - `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`(있다면), `KAKAO_REDIRECT_URI`
   - `NEXT_PUBLIC_APP_URL` — 배포되면 나오는 `https://xxx.vercel.app` 주소로 설정
   - `CRON_SECRET`
4. 배포가 끝나면, **카카오 개발자 콘솔 → 앱 → 플랫폼 키 → REST API 키 수정**에서
   `KAKAO_REDIRECT_URI`(`https://xxx.vercel.app/api/kakao/callback`)를 로그인
   리다이렉트 URI로 추가 등록 (기존 `localhost` 항목은 남겨둬도 됩니다)

## 음성 입력에 대해

브라우저 내장 Web Speech API를 사용하며 별도 API 키가 필요 없습니다. Chrome,
Edge 등 최신 브라우저에서 지원되며, 마이크 접근 권한이 필요합니다.
