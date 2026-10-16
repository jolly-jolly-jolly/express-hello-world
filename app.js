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
      <h2>🇮🇳 India Ranked Web Search</h2>
      <p style="color: #666; font-size: 14px;">Cloud Node Mapped • DuckDuckGo Lite Index (India Scoped)</p>
      <form action="/search" method="GET" style="display: flex; gap: 10px; margin-top: 20px;">
        <input type="text" name="q" placeholder="Search the web (e.g., tech, news, startups)..." required style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        <button type="submit" style="background: #000; color: #fff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Search</button>
      </form>
    </div>
  `);
});

// 2. Handle Query & Fetch Ranked URLs via DuckDuckGo Lite
app.get('/search', async (req, res) => {
  const query = req.query.q;
  // Force India geographical and domain scope into the search query
  const scopedQuery = `${query} site:.in India`;

  let resultsHtml = `<p>No ranked web results found.</p>`;

  try {
    const response = await fetch('https://lite.duckduckgo.com/lite/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      body: `q=${encodeURIComponent(scopedQuery)}`
    });

    const htmlText = await response.text();
    const $ = cheerio.load(htmlText);
    let resultsList = '';

    // Parse DuckDuckGo Lite result table rows
    $('.result-link').each((i, element) => {
      const title = $(element).text().trim();
      const link = $(element).attr('href');
      
      // Get the snippet from the adjacent snippet row
      const snippet = $(element).closest('tr').next('tr').find('.result-snippet').text().trim();

      if (title && link) {
        resultsList += `
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <a href="${link}" target="_blank" style="font-size: 16px; color: #1a0dab; text-decoration: none; font-weight: bold;">${title}</a><br>
            <span style="font-size: 12px; color: #006621;">${link}</span>
            <p style="font-size: 14px; color: #333; margin: 5px 0 0 0;">${snippet}</p>
          </div>
        `;
      }
    });

    if (resultsList) {
      resultsHtml = resultsList;
    }
  } catch (error) {
    console.error("Search scraping error:", error);
    resultsHtml = `<p>Error fetching ranked web results. Please try again.</p>`;
  }

  res.send(`
    <div style="font-family: sans-serif; max-width: 700px; margin: 30px auto; padding: 20px;">
      <a href="/" style="text-decoration: none; color: #000; font-weight: bold;">← Back to Search</a>
      <h2>Ranked Results for: "${query}" <span style="font-size: 14px; color: #666;">(India Scoped)</span></h2>
      <hr style="border: 0; border-top: 1px solid #ddd; margin-bottom: 20px;" />
      ${resultsHtml}
    </div>
  `);
});

const server = app.listen(port, () => {
  console.log(`India Web Search Engine running on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
