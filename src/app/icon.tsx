import { ImageResponse } from "next/og";

export const size = {
  width: 48,
  height: 48,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>{`.bg{fill:#2D2D2D}.fg{fill:#fff}`}</style>
        </defs>
        <rect x="1" y="1" width="28" height="28" rx="4" className="bg" />
        <path
          className="fg"
          d="M15.47 7.1l-1.3 1.85c-.2.29-.54.47-.9.47H6.17V7.09c-.01.01 9.3.01 9.3.01z"
        />
        <polygon className="fg" points="24.3 7.1 13.14 22.91 5.7 22.91 16.86 7.1" />
        <path
          className="fg"
          d="M14.53 22.91l1.31-1.86c.2-.29.54-.47.9-.47h7.09v2.33h-9.3z"
        />
      </svg>
    ),
    size
  );
}