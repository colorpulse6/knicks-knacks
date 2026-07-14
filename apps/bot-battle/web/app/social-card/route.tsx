import { ImageResponse } from "next/og";
import { SITE } from "../config/site";
import { SocialCard } from "./SocialCard";

export function GET() {
  return new ImageResponse(<SocialCard />, {
    width: SITE.socialImage.width,
    height: SITE.socialImage.height,
  });
}
