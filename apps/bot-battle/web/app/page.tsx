import type { Metadata } from "next";
import BenchmarkClient from "./BenchmarkClient";
import { HomeExplainer, HomeIntro } from "./components/HomeSeoContent";
import { SITE } from "./config/site";
import { serializeJsonLd, WEB_APPLICATION_JSON_LD } from "./structured-data";

export const metadata: Metadata = {
  title: SITE.pageTitle,
  description: SITE.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE.homeTitle,
    description: SITE.description,
    url: "/",
    siteName: SITE.name,
    type: "website",
    images: [SITE.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.homeTitle,
    description: SITE.description,
    images: [SITE.socialImage],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(WEB_APPLICATION_JSON_LD),
        }}
      />
      <HomeIntro />
      <BenchmarkClient />
      <HomeExplainer />
    </>
  );
}
