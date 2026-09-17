import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function movieScraperDevPlugin() {
  return {
    name: 'movie-scraper-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/scrape-movies')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const targetUrl = urlObj.searchParams.get('url');

            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing url query parameter' }));
              return;
            }

            const fetchRes = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
              }
            });

            if (!fetchRes.ok) {
              res.statusCode = fetchRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Upstream error ${fetchRes.status}` }));
              return;
            }

            const html = await fetchRes.text();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ html, url: targetUrl }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Scraping failed' }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), movieScraperDevPlugin()],
  server: {
    port: 3000,
    open: true
  }
});

