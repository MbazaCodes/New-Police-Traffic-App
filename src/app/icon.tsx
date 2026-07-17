import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48, height: 48,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%",
          background: "white",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://tz-police-pwa.vercel.app/police-logo.png"
          width={44}
          height={44}
          alt="TPF"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size
  );
}
