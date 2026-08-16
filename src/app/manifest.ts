import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "나의 하루 | 일정·할일·일기",
    short_name: "나의 하루",
    description: "일정 관리, 할일, 일기를 한 곳에서. 타자와 음성으로 기록하고 카카오톡으로 알림받기.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f5",
    theme_color: "#db2777",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
