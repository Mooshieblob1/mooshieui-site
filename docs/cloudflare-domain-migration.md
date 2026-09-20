# Move the site to mooshieui.com

Use `https://mooshieui.com` as the primary address. Attach it to the existing
Cloudflare Pages project, keeping the current deployment and Git integration.
The domain was purchased through Cloudflare Registrar, so no registrar transfer
or nameserver change is needed.

## 1. Connect the new domain

1. Sign in to the Cloudflare account containing both the domain and Pages project.
2. Open **Workers & Pages**, then the existing site project. `wrangler.toml`
   names it `mooshieui-site`; confirm the dashboard project serves the current site.
3. Open **Custom domains → Set up a domain**, enter `mooshieui.com`, and continue.
4. Confirm the DNS record Cloudflare proposes. Let Pages create the record pointing
   to the project's actual `*.pages.dev` hostname.
5. Repeat for `www.mooshieui.com` so it has DNS and HTTPS before adding its redirect.
6. Wait for both custom domains to report **Active**. Open
   `https://mooshieui.com`, `/build`, and `/docker` and check that HTTPS works.

The apex domain must be a zone in the same Cloudflare account as the Pages
project. Add the domain through Pages first: creating only a DNS CNAME without
associating the custom domain with Pages can produce a 522 error.
See [Cloudflare's custom-domain instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## 2. Deploy the domain metadata

After the new address works, deploy this repository's domain changes through the
existing production deployment workflow. For a Git-connected Pages project,
commit and push the changes to its configured production branch; for a project
using Direct Upload, upload the contents of `dist` after building.

```powershell
npm run check
npm run build
```

The Pages build command is `npm run build` and the output directory is `dist`.
The deployment includes canonical URLs for each page, social image URLs,
`robots.txt`, and `sitemap.xml`, all using the origin in `src/lib/site.js`.
The sitemap lists `/`, `/build`, and `/docker`; extend `SITE_PATHS` when adding
public pages. No environment variable or server runtime is required.

## 3. Redirect www and the old address

Create these rules only after the new site's HTTPS and production deployment work.
For each row below, open the indicated domain zone, then **Rules → Overview →
Create rule → Redirect Rule**. Select **Custom filter expression**, then match
**Hostname → equals** using the hostname below (no scheme or path).

| Cloudflare zone | Rule name | Hostname equals |
| --- | --- | --- |
| `mooshieui.com` | `www to primary domain` | `www.mooshieui.com` |
| `mooshieblob.com` | `MooshieUI to new domain` | `mooshieui.mooshieblob.com` |

For the old domain, the expression editor equivalent is:

```text
(http.host eq "mooshieui.mooshieblob.com")
```

Under **Then → URL redirect**, select **Dynamic** and enter:

```text
concat("https://mooshieui.com", http.request.uri.path)
```

Set **Status code** to **301** and enable **Preserve query string**, then deploy.
This matches both HTTP and HTTPS and preserves the path. For example, the old
`/docker?ref=readme` address should redirect to
`https://mooshieui.com/docker?ref=readme`.

If Cloudflare warns that traffic for `http` is not proxied, do not create a DNS
record named `http`. Return to the rule and use the explicit hostname match above.
Under **mooshieblob.com → DNS → Records**, confirm the existing `mooshieui` record
is proxied; keep its current Pages target.

Keep the old custom domain attached to Pages, its DNS record **Proxied** (orange
cloud), and its certificate active so existing HTTPS links can reach the redirect.
Confirm `www` is also proxied. The old-domain rule matches only the
`mooshieui` subdomain, leaving the main `mooshieblob.com` site alone.

See Cloudflare's [dashboard instructions](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/)
and [hostname-redirect example](https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/).
These hostname redirects belong in Cloudflare Rules; Pages' `_redirects` file
does [not support domain-level redirects](https://developers.cloudflare.com/pages/configuration/redirects/).

## 4. Enforce HTTPS

In the `mooshieui.com` zone, go to **SSL/TLS → Edge Certificates** and enable
**Always Use HTTPS** after the certificate is active. This also redirects plain
`http://mooshieui.com` requests to HTTPS.
See [Always Use HTTPS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/).

## 5. Optionally redirect the production pages.dev address

Copy the exact production `*.pages.dev` hostname from the Pages project. At the
account level, open **Bulk Redirects**, create a list with one redirect, and
create/enable a Bulk Redirect Rule using that list:

| Setting | Value |
| --- | --- |
| Source URL | `<actual-project>.pages.dev/` (replace with the dashboard hostname; omit the scheme to match HTTP and HTTPS) |
| Target URL | `https://mooshieui.com/` |
| Status | `301` |
| Preserve query string | Enabled |
| Subpath matching | Enabled |
| Preserve path suffix | Enabled |
| Include subdomains | Disabled, so branch and deployment preview URLs keep working |

Never include `mooshieui.com` itself as a redirect source to itself.
See [Cloudflare's Pages redirect guide](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/)
and [Bulk Redirect setup](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-dashboard/).

## 6. Verify the cutover

```powershell
curl.exe -I https://mooshieui.com/
curl.exe -I https://mooshieui.com/build
curl.exe -I https://mooshieui.com/docker
curl.exe -I https://mooshieui.com/assets/logo.png
curl.exe -I http://mooshieui.com/
curl.exe -I 'https://www.mooshieui.com/build?ref=domain-check'
curl.exe -I 'https://mooshieui.mooshieblob.com/docker?ref=domain-check'
curl.exe https://mooshieui.com/robots.txt
curl.exe https://mooshieui.com/sitemap.xml
```

The new HTTPS pages and image should return 200. HTTP, www, and the old address
should redirect to the HTTPS primary address; the www and old-domain rules must
retain the path and query string. Inspect the page source for a single canonical
URL matching each page on `mooshieui.com`, and check that download links still work.
Test the `pages.dev` redirect too if enabled.

Once live, update the website link in the GitHub repository's About section and
any README/wiki links that advertise the old site. If using Google Search
Console, verify the new domain and submit `https://mooshieui.com/sitemap.xml`.

Keep the old redirect available for existing bookmarks and search results. If a
new rule causes trouble, disable that rule first; the original Pages deployment
and old custom domain remain available. If abandoning the new domain entirely,
also revert `SITE_URL` and redeploy the metadata.
