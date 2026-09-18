import { renderIcon } from "@/lib/og";

// iOS rounds the corners itself, so the square is drawn flat.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderIcon(size.width, false);
}
