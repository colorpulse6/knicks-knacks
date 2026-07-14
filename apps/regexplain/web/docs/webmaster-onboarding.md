# Regexplain Webmaster Onboarding

_Operator runbook — verified against the codebase on 2026-07-14._

This runbook covers post-deployment actions in Google Search Console, Bing Webmaster Tools, and Vercel. The build does not create properties, change DNS, set production environment variables, redeploy, submit URLs, or request indexing. Completing these steps sends discovery signals; it does not guarantee indexing, traffic, or ranking.

## Production URLs

- Homepage: <https://www.regexplain.cc/>
- Inspection example: <https://www.regexplain.cc/examples/email-regex>
- Robots policy: <https://www.regexplain.cc/robots.txt>
- Sitemap: <https://www.regexplain.cc/sitemap.xml>

## 1. Run production preflight

Do this after the intended release is deployed and before opening either webmaster console.

```bash
curl -sS -o /dev/null -w '%{http_code} https://www.regexplain.cc/\n' https://www.regexplain.cc/
curl -sS -o /dev/null -w '%{http_code} https://www.regexplain.cc/examples/email-regex\n' https://www.regexplain.cc/examples/email-regex
curl -sS -o /dev/null -w '%{http_code} https://www.regexplain.cc/robots.txt\n' https://www.regexplain.cc/robots.txt
curl -sS -o /dev/null -w '%{http_code} https://www.regexplain.cc/sitemap.xml\n' https://www.regexplain.cc/sitemap.xml
curl -sS https://www.regexplain.cc/robots.txt
curl -sS https://www.regexplain.cc/sitemap.xml
```

Confirm:

1. All four production URLs return `200`.
2. View each page's source in a browser and confirm its canonical link is, respectively, `https://www.regexplain.cc/` and `https://www.regexplain.cc/examples/email-regex`.
3. `robots.txt` is `200`, allows public crawling, disallows `/api/`, and names `https://www.regexplain.cc/sitemap.xml`.
4. `sitemap.xml` is `200`, is valid XML, and lists only `https://www.regexplain.cc/` plus the five intended example pages on the `www` host.

Stop and fix a failed preflight check before submitting anything.

## 2. Verify Google Search Console

Google's [property setup guide](https://support.google.com/webmasters/answer/34592) explains the two property types, and its [ownership guide](https://support.google.com/webmasters/answer/9008080) covers verification methods.

### Preferred: Domain property

Use this when you can edit DNS:

1. Add a Domain property named exactly `regexplain.cc` — no scheme, path, or `www`.
2. Copy the TXT record that Google provides into the domain's DNS configuration.
3. Wait for DNS propagation, then select **Verify** in Search Console. Keep the TXT record in DNS after verification.

This property covers the root domain, `www`, other subdomains, and both HTTP and HTTPS.

### Fallback: URL-prefix property

Use this when DNS access is unavailable:

1. Add the URL-prefix property `https://www.regexplain.cc/`.
2. Choose the HTML tag verification method. From Google's tag, copy only the `content` token — do not paste the complete `<meta>` tag into Vercel.
3. In the Regexplain Vercel project, add `GOOGLE_SITE_VERIFICATION` with that token to the **Production** environment.
4. Create a new Production deployment. Vercel environment changes apply only to new deployments; see [Vercel environment variables](https://vercel.com/docs/environment-variables).
5. Open page source for `https://www.regexplain.cc/`, or run `curl -sS https://www.regexplain.cc/ | rg 'google-site-verification'`, and confirm the rendered tag contains the token.
6. Return to Search Console and select **Verify**. Keep the environment variable after verification.

## 3. Submit and inspect in Google

1. Open **Sitemaps** and submit exactly `https://www.regexplain.cc/sitemap.xml`. Check the processed result for fetch or parse errors; see Google's [Sitemaps report guide](https://support.google.com/webmasters/answer/7451001).
2. Open **URL Inspection** for `https://www.regexplain.cc/`. Run the live test and, if the UI offers it, select **Request indexing**.
3. Repeat URL Inspection and the indexing request for `https://www.regexplain.cc/examples/email-regex`.

Google documents these actions in the [URL Inspection guide](https://support.google.com/webmasters/answer/9012289). A submitted sitemap or indexing request is a discovery/crawl signal, not a promise that Google will index or rank the page.

## 4. Verify Bing Webmaster Tools

### Preferred: import from Google

If the Google property is verified, use Bing's **Import from Google Search Console** flow. Select the Regexplain property and complete the requested Google authorization. Bing documents the import and manual alternatives in [Add and verify a site](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b).

### Fallback: add and verify manually

1. Add `https://www.regexplain.cc/` to Bing Webmaster Tools.
2. Choose HTML meta tag verification. From Bing's tag, copy only the `content` token for `msvalidate.01`.
3. In the Regexplain Vercel project, add `BING_SITE_VERIFICATION` with that token to the **Production** environment.
4. Create a new Production deployment.
5. Open page source for `https://www.regexplain.cc/`, or run `curl -sS https://www.regexplain.cc/ | rg 'msvalidate.01'`, and confirm the rendered tag contains the token.
6. Return to Bing and complete verification. Keep the environment variable after verification.

## 5. Submit and inspect in Bing

1. Open **Sitemaps** and submit exactly `https://www.regexplain.cc/sitemap.xml`, even if the Google import already discovered it. Confirm that processing completes without crawl or parse errors; see Bing's [Sitemaps guide](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed).
2. Use **URL Inspection** for `https://www.regexplain.cc/`, then for `https://www.regexplain.cc/examples/email-regex`. Review crawl, index, SEO, and markup results.
3. If Bing offers **Request indexing** for either URL, it is optional to use it. The action is subject to Bing's quota and does not guarantee indexing or ranking. See Bing's [URL Inspection guide](https://www.bing.com/webmasters/help/URL-Inspection-55a30305).

## 6. Monitor after verification and releases

Check both consoles after onboarding, after meaningful deployments, and periodically thereafter:

- Page coverage/indexing status for the homepage and all five examples.
- Sitemap fetch, parse, and discovered-URL counts; crawl errors and blocked URLs.
- The search engine's selected canonical. It should be the HTTPS `www.regexplain.cc` URL, not the bare domain or a preview deployment.
- Structured-data/enhancement reports where the consoles recognize the homepage markup.
- Google Security Issues and Manual Actions, plus Bing security or guideline warnings where relevant.
- Fresh URL Inspection results after changes to metadata, routing, robots policy, canonical URLs, or example content.

If a release changes verification metadata or the canonical/discovery routes, rerun the production preflight before relying on console data.
