const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Render the India-Scoped Search Interface
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>🇮🇳 India Ranked Web Search Engine</h2>
      <p style="color: #666; font-size: 14px;">Cloud Node Mapped • Live Ranked Web URLs (India Scoped)</p>
      <form action="/search" method="GET" style="display: flex; gap: 10px; margin-top: 20px;">
        <input type="text" name="q" placeholder="Search the web (e.g., tech news, startups, policies)..." required style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        <button type="submit" style="background: #000; color: #fff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Search</button>
      </form>
    </div>
  `);
});

// 2. Handle Query & Fetch Ranked URLs via Open Metasearch API
app.get('/search', async (req, res) => {
  const query = req.query.q;
  // Force India geographical and domain scope into the search query
  const scopedQuery = `${query} site:.in India`;

  let resultsHtml = `<p>No ranked web results found.</p>`;

  try {
    // Query a public open metasearch JSON endpoint
    const searchUrl = `https://searx.be/search?q=${encodeURIComponent(scopedQuery)}&format=json`;
    
    const response = await fetch(searchUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' 
      }
    });
    
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      let resultsList = '';
      // Loop through the ranked web results
      data.results.forEach(item => {
        resultsList += `
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <a href="${item.url}" target="_blank" style="font-size: 16px; color: #1a0dab; text-decoration: none; font-weight: bold;">${item.title}</a><br>
            <span style="font-size: 12px; color: #006621;">${item.url}</span>
            <p style="font-size: 14px; color: #333; margin: 5px 0 0 0;">${item.content || ''}</p>
          </div>
        `;
      });
      resultsHtml = resultsList;
    }
  } catch (error) {
    console.error("Search API error:", error);
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
  console.log(`Ranked Web Search Engine running on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
