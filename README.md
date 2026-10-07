# Haze Watch on Vercel

Static site, no build step:

- `index.html` – the redesigned app, wired to live data
- `api/nea.js` – a tiny serverless proxy for NEA readings on data.gov.sg (runs automatically on Vercel)
- `vercel.json` – clean URLs and two security headers

## Where the data comes from

- **NEA (data.gov.sg)**: 24-hr PSI, pollutants and hourly PM2.5 for the five regions. The page calls `/api/nea` on its own domain, so it doesn't depend on data.gov.sg allowing cross-site requests. Vercel caches each answer for 5 minutes (1 hour for past days).
- **Open-Meteo**: weather, forecasts, region forecasts and ASEAN city AQI. Called straight from the browser (Open-Meteo allows this). Free, no key, non-commercial use.
- If either source can't be reached, the page shows example values from 6 Oct 2026, marks them as examples, and says so in a banner.

## Deploy with the Vercel CLI (quickest)

1. Install Node.js, then run `npm i -g vercel`
2. Unzip `haze-watch-vercel.zip` and open a terminal in that folder
3. Run `vercel` and accept the defaults (log in, create a new project, "Other" framework, no build command). This gives you a preview URL.
4. Run `vercel --prod` to publish to your production URL.

## Deploy from GitHub

1. Put the contents of this folder in a new GitHub repository (`index.html`, `vercel.json`, `api/` at the repo root).
2. On vercel.com, choose **Add New → Project**, import the repository.
3. Framework preset: **Other**. Leave build command and output directory empty. Click **Deploy**.

Every push to the main branch redeploys.

## Optional

- data.gov.sg rate-limits anonymous use. The edge cache keeps traffic low, but if you see NEA falling back to example values often, get a free API key from data.gov.sg and add it in Vercel under **Settings → Environment Variables** as `DATA_GOV_SG_API_KEY`, then redeploy.
- Opening `index.html` straight from disk also works; it then calls data.gov.sg directly instead of through the proxy.
