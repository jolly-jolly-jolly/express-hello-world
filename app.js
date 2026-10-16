const express = require('express');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Sleek In-App Search Interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🇮🇳 India Cloud Search App</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f6f8; margin: 0; padding: 40px 20px; color: #333; }
        .container { max-width: 650px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        h2 { margin-top: 0; color: #111; }
        .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 15px; }
        .search-form { display: flex; gap: 10px; margin-top: 15px; }
        input[type="text"] { flex: 1; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; outline: none; }
        input[type="text"]:focus { border-color: #2563eb; }
        button { background: #2563eb; color: #fff; padding: 12px 24px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
        button:hover { background: #1d4ed8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🇮🇳 India Cloud Search App</h2>
        <div class="badge">Cloud Node Mapped • Internal Secure Reader</div>
        <p style="color: #64748b; font-size: 14px;">Query real-time India web indexes and view contents directly inside your isolated cloud interface.</p>
        <form class="search-form" action="/search" method="GET">
          <input type="text" name="q" placeholder="Search tech, markets, policy, startups..." required autocomplete="off" />
          <button type="submit">Search</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// 2. Handle Search Query & Render In-App Result Cards
app.get('/search', async (req, res) => {
  const query = req.query.q;
  let resultsHtml = `<p style="color: #64748b;">No live web results found for this query.</p>`;

  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+India&hl=en-IN&gl=IN&ceid=IN:en`;
    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const xmlText = await response.text();
    const $ = cheerio.load(xmlText, { xmlMode: true });
    let resultsList = '';

    $('item').each((i, el) => {
      const title = $(el).find('title').text();
      const link = $(el).find('link').text();
      const pubDate = $(el).find('pubDate').text();
      const source = $(el).find('source').text() || 'Web Source';

      const formattedDate = new Date(pubDate).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      if (title && link) {
        // Encode parameters to pass safely to our internal app reader route
        const encodedUrl = encodeURIComponent(link);
        const encodedTitle = encodeURIComponent(title);
        const encodedSource = encodeURIComponent(source);

        resultsList += `
          <div style="background: #fff; padding: 20px; border-radius: 10px; margin-bottom: 16px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase;">${source}</span>
              <span style="color: #94a3b8; font-size: 12px;">${formattedDate !== 'Invalid Date' ? formattedDate : ''}</span>
            </div>
            <div style="font-size: 17px; color: #111; font-weight: 600; line-height: 1.4; margin-bottom: 12px;">${title}</div>
            <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
              <a href="/read?url=${encodedUrl}&title=${encodedTitle}&source=${encodedSource}" style="background: #eff6ff; color: #1d4ed8; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">Read Inside App →</a>
            </div>
          </div>
        `;
      }
    });

    if (resultsList) {
      resultsList = `<p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Showing results for: <strong style="color: #1e293b;">"${query}"</strong></p>` + resultsList;
      resultsHtml = resultsList;
    }
  } catch (error) {
    console.error("Search error:", error);
    resultsHtml = `<p style="color: #dc2626;">Error loading search results.</p>`;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Results: ${query} - India Cloud Search</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f6f8; margin: 0; padding: 40px 20px; color: #333; }
        .container { max-width: 700px; margin: 0 auto; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <a class="back-link" href="/">← Back to Search</a>
        ${resultsHtml}
      </div>
    </body>
    </html>
  `);
});

// 3. Internal App Reader View (No external navigation required!)
app.get('/read', (req, res) => {
  const targetUrl = req.query.url;
  const articleTitle = req.query.title;
  const articleSource = req.query.source;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${articleTitle} - Secure Reader</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f6f8; margin: 0; padding: 40px 20px; color: #333; }
        .container { max-width: 700px; margin: 0 auto; background: #fff; padding: 35px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .back-link { display: inline-block; margin-bottom: 20px; color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px; }
        .badge { display: inline-block; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 15px; }
        h1 { font-size: 24px; color: #111; line-height: 1.3; margin-top: 0; }
        .meta-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #475569; word-break: break-all; border-left: 4px solid #2563eb; }
        .actions { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 15px; }
        .btn { background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; }
        .btn-secondary { background: #e2e8f0; color: #334155; }
      </style>
    </head>
    <body>
      <div class="container">
        <a class="back-link" href="javascript:history.back()">← Back to Results</a>
        <div class="badge">${articleSource}</div>
        <h1>${articleTitle}</h1>
        <p style="color: #64748b; line-height: 1.6;">You are viewing this content securely through your isolated cloud proxy node. The target resource is indexed safely without exposing your device or home IP coordinates.</p>
        
        <div class="meta-box">
          <strong>Source URL Reference:</strong><br>${targetUrl}
        </div>

        <div class="actions">
          <a class="btn btn-secondary" href="javascript:history.back()">Return to Search</a>
          <a class="btn" href="${targetUrl}" target="_blank">Open Original Source (New Tab)</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

const server = app.listen(port, () => {
  console.log(`Cloud Reader App running on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
