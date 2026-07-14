# BotBattle Search Console and Bing onboarding runbook

**Runbook date:** 2026-07-14

**Canonical site:** `https://www.botbattle.cc/`

Use this checklist after the SEO changes have been deployed. It prepares the
canonical homepage for discovery, but it cannot guarantee crawling, indexing,
rankings, rich results, or AI citations.

## Authority boundary

This document is an operator checklist only. It does **not** authorize or
perform a deployment, DNS change, Search Console or Bing account change,
sitemap submission, Live Test, Site Scan, or indexing request. Those are
outward-facing actions and require separate approval from the site owner.

## Before opening webmaster tools

1. Confirm the deployed apex URL redirects directly to the canonical `www`
   homepage:

   ```bash
   curl -sS -D - -o /dev/null https://botbattle.cc/
   ```

   Pass only when the response is a single permanent redirect and its
   `Location` is exactly `https://www.botbattle.cc/`. Follow the destination
   separately and confirm it returns `200`; do not accept an apex-to-HTTP,
   HTTP-to-HTTPS, or other multi-hop chain.

2. Confirm these deployed URLs return `200` before submitting anything:

   - `https://www.botbattle.cc/`
   - `https://www.botbattle.cc/robots.txt`
   - `https://www.botbattle.cc/sitemap.xml`

## Google Search Console

1. In Google Search Console, add `botbattle.cc` as a **Domain property**. Enter
   the bare domain, without a protocol, path, or `www`. Follow Google's
   [property ownership verification instructions](https://support.google.com/webmasters/answer/9008080).
2. Add the DNS TXT value Google provides. Wait for DNS propagation, complete
   verification, and **retain the TXT record after verification** so ownership
   remains verifiable.
3. Open **Sitemaps** for the verified property and submit exactly
   `https://www.botbattle.cc/sitemap.xml`. Google's
   [sitemap documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
   explains submission and status checks. Confirm the submitted sitemap is
   accepted and resolves to the canonical homepage.
4. After the deployment is live, inspect exactly
   `https://www.botbattle.cc/` with the
   [URL Inspection tool](https://support.google.com/webmasters/answer/9012289).
   Run **Test Live URL**, verify Google can fetch the canonical page and its
   resources, then use **Request indexing once**. Do not repeatedly request
   indexing; a request does not guarantee inclusion.

## Structured-data expectation

1. Extract the homepage's `application/ld+json` block and validate it with the
   [Schema.org validator](https://validator.schema.org/). Expected result:
   valid `WebApplication` semantics for the visible free web application.
2. Test the same deployed homepage or extracted code with Google's
   [Rich Results Test](https://search.google.com/test/rich-results). Compare any
   findings with Google's
   [Software app structured-data requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app).
3. Expected result: the `WebApplication` markup may be valid Schema.org, while
   Google reports no eligible software-app rich result because BotBattle does
   not currently publish a genuine review or aggregate rating. This is not an
   implementation defect. Do not invent a review, rating, or rating count to
   remove the warning or create eligibility.

## Bing Webmaster Tools

1. In Bing Webmaster Tools, choose **Import** and connect the Google account
   that owns the verified Search Console property. Import `botbattle.cc` using
   Bing's official
   [Search Console import procedure](https://blogs.bing.com/webmaster/september-2019/Import-sites-from-Search-Console-to-Bing-Webmaster-Tools).
   If import is unavailable, stop and use Bing's official
   [add and verify site guidance](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b)
   rather than adding an unplanned verification method.
2. In **Sitemaps**, confirm the imported sitemap is
   `https://www.botbattle.cc/sitemap.xml`, its fetch succeeds, and it contains
   the canonical homepage. Submit it manually only if import did not bring it
   across and the site owner has approved the external change.
3. Use Bing's official
   [URL Inspection tool](https://www.bing.com/webmasters/help/URL-Inspection-55a30305)
   for `https://www.botbattle.cc/`. Check the index, SEO, markup, and Live URL
   views; record crawl or canonical errors instead of repeatedly requesting
   indexing.
4. Run Bing's official
   [Site Scan](https://www.bing.com/webmasters/help/site-scan-623520c9) against
   the canonical homepage or submitted sitemap. Record errors and warnings,
   and route production defects through the normal change-and-deploy process.

## Follow-up schedule

- **After 7 days:** review Google page indexing and sitemap status; review Bing
  URL Inspection, sitemap status, and Site Scan. Record discovery/indexing
  state, last crawl, canonical selection, and every crawl or markup error.
- **After 28 days:** repeat the same checks and compare them with the day-7
  notes. Investigate persistent crawl errors or a search-engine-selected
  canonical that differs from `https://www.botbattle.cc/`. Treat a clean but
  not-yet-indexed result as a status to monitor, not permission to spam indexing
  requests or alter structured data with unsupported claims.

For each check, record the date, operator, property, submitted URL, observed
status, and any follow-up owner. Preserve the DNS TXT verification record unless
the site owner intentionally retires the property.
