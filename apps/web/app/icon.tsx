import { ImageResponse } from "next/og";

// Favicon + Organization logo (referenced by JSON-LD at /icon).
export const size = { width: 128, height: 128 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          color: "#ffffff",
          fontSize: 84,
          fontWeight: 800,
          borderRadius: 28,
        }}
      >
        M
      </div>
    ),
    { ...size },
  );
}
