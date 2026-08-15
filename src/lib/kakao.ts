import { prisma } from "@/lib/prisma";

const AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const MEMO_URL = "https://kapi.kakao.com/v2/api/talk/memo/default/send";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 환경변수가 설정되어 있지 않습니다.`);
  return value;
}

export function isKakaoConfigured(): boolean {
  return Boolean(process.env.KAKAO_REST_API_KEY && process.env.KAKAO_REDIRECT_URI);
}

export function getAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("KAKAO_REST_API_KEY"),
    redirect_uri: requireEnv("KAKAO_REDIRECT_URI"),
    response_type: "code",
    scope: "talk_message",
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

async function requestToken(params: Record<string, string>): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: requireEnv("KAKAO_REST_API_KEY"),
    ...(process.env.KAKAO_CLIENT_SECRET
      ? { client_secret: process.env.KAKAO_CLIENT_SECRET }
      : {}),
    ...params,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`카카오 토큰 요청 실패: ${text}`);
  }
  return res.json();
}

export async function exchangeCodeForToken(code: string) {
  return requestToken({
    grant_type: "authorization_code",
    redirect_uri: requireEnv("KAKAO_REDIRECT_URI"),
    code,
  });
}

export async function refreshAccessToken(refreshToken: string) {
  return requestToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function saveKakaoTokens(userId: string, token: TokenResponse) {
  const expiresAt = new Date(Date.now() + token.expires_in * 1000);
  await prisma.kakaoAccount.upsert({
    where: { userId },
    update: {
      accessToken: token.access_token,
      ...(token.refresh_token ? { refreshToken: token.refresh_token } : {}),
      expiresAt,
    },
    create: {
      userId,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? "",
      expiresAt,
    },
  });
}

// Returns a currently-valid access token for the user, refreshing it first if
// it's within 5 minutes of expiry. Returns null if the user hasn't connected Kakao.
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.kakaoAccount.findUnique({ where: { userId } });
  if (!account) return null;

  const expiresSoon = account.expiresAt.getTime() - Date.now() < 5 * 60 * 1000;
  if (!expiresSoon) return account.accessToken;

  const refreshed = await refreshAccessToken(account.refreshToken);
  await saveKakaoTokens(userId, refreshed);
  return refreshed.access_token;
}

export async function sendMemoToMe(accessToken: string, text: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://developers.kakao.com";
  const templateObject = {
    object_type: "text",
    text,
    link: { web_url: appUrl, mobile_web_url: appUrl },
    button_title: "앱 열기",
  };

  const res = await fetch(MEMO_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams({ template_object: JSON.stringify(templateObject) }),
  });

  if (!res.ok) {
    const text2 = await res.text();
    throw new Error(`카카오 메시지 전송 실패: ${text2}`);
  }
  return res.json();
}
