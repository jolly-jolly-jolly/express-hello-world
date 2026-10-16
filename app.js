const express = require('express');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Render the India-Scoped Search Interface
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>🇮🇳 India Live Web Search</h2>
      <p style="color: #666; font-size: 14px;">Cloud Node Mapped • Google India RSS Feed Index</p>
      <form action="/search" method="GET" style="display: flex; gap: 10px; margin-top: 20px;">
        <input type="text" name="q" placeholder="Search live web URLs (e.g., tech, business, startups)..." required style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        <button type="submit" style="background: #000; color: #fff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Search</button>
      </form>
    </div>
  `);
});

// 2. Handle Query & Fetch Live Ranked Web URLs via Google RSS Feed
app.get('/search', async (req, res) => {
  const query = req.query.q;
  
  let resultsHtml = `<p>No live web results found.</p>`;

  try {
    // Official Google News/Web RSS feed explicitly locked to India (gl=IN, hl=en-IN)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+India&hl=en-IN&gl=IN&ceid=IN:en`;
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    const xmlText = await response.text();
    // Parse XML feed using Cheerio with xmlMode enabled
    const $ = cheerio.load(xmlText, { xmlMode: true });
    let resultsList = '';

    $('item').each((i, el) => {
      const title = $(el).find('title').text();
      const link = $(el).find('link').text();
      const pubDate = $(el).find('pubDate').text();
      const source = $(el).find('source').text() || 'Web Source';

      if (title && link) {
        resultsList += `
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <a href="${link}" target="_blank" style="font-size: 16px; color: #1a0dab; text-decoration: none; font-weight: bold;">${title}</a><br>
            <span style="font-size: 12px; color: #006621;">${link}</span> <span style="font-size: 11px; color: #666; background: #eee; padding: 2px 6px; border-radius: 3px; margin-left: 5px;">${source}</span>
            <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">Published: ${pubDate}</p>
          </div>
        `;
      }
    });

    if (resultsList) {
      resultsHtml = resultsList;
    }
  } catch (error) {
    console.error("RSS fetch error:", error);
    resultsHtml = `<p>Error fetching live web results. Please try again.</p>`;
  }

  res.send(`
    <div style="font-family: sans-serif; max-width: 700px; margin: 30px auto; padding: 20px;">
      <a href="/" style="text-decoration: none; color: #000; font-weight: bold;">← Back to Search</a>
      <h2>Live Results for: "${query}" <span style="font-size: 14px; color: #666;">(India Scoped)</span></h2>
      <hr style="border: 0; border-top: 1px solid #ddd; margin-bottom: 20px;" />
      ${resultsHtml}
    </div>
  `);
});

const server = app.listen(port, () => {
  console.log(`India RSS Search Engine running on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
