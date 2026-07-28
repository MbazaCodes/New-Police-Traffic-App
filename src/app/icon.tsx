import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48, height: 48,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%", background: "white",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: "bold", color: "#1E3A8A" }}>TP</div>
      </div>
    ),
    size
  );
}
