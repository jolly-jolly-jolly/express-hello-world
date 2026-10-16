const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Render the India-Scoped Search Interface
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>🇮🇳 India Micro Search Engine</h2>
      <p style="color: #666; font-size: 14px;">Cloud Node IP Mapped • Strictly Scoped to India Knowledge</p>
      <form action="/search" method="GET" style="display: flex; gap: 10px; margin-top: 20px;">
        <input type="text" name="q" placeholder="Search anything in India (e.g., history, tech, cities, economy)..." required style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        <button type="submit" style="background: #000; color: #fff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Search</button>
      </form>
    </div>
  `);
});

// 2. Handle Search Query & Force India Scope via Wikipedia API
app.get('/search', async (req, res) => {
  const query = req.query.q;
  // Automatically bind India context to every query
  const scopedQuery = `${query} India`; 

  let resultsHtml = `<p>No results found.</p>`;

  try {
    // Official public Wikipedia API endpoint (fast, reliable, never blocks cloud IPs)
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(scopedQuery)}&format=json&origin=*`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.query && data.query.search && data.query.search.length > 0) {
      let resultsList = '';
      data.query.search.forEach(item => {
        const title = item.title;
        const snippet = item.snippet.replace(/(<([^>]+)>)/gi, ""); // Strip HTML tags from snippet
        const link = `https://en.wikipedia.org/?curid=${item.pageid}`;

        resultsList += `
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <a href="${link}" target="_blank" style="font-size: 16px; color: #1a0dab; text-decoration: none; font-weight: bold;">${title}</a><br>
            <span style="font-size: 12px; color: #006621;">${link}</span>
            <p style="font-size: 14px; color: #333; margin: 5px 0 0 0;">${snippet}...</p>
          </div>
        `;
      });
      resultsHtml = resultsList;
    }
  } catch (error) {
    console.error("Search execution error:", error);
    resultsHtml = `<p>Error fetching search results.</p>`;
  }

  res.send(`
    <div style="font-family: sans-serif; max-width: 700px; margin: 30px auto; padding: 20px;">
      <a href="/" style="text-decoration: none; color: #000; font-weight: bold;">← Back to Search</a>
      <h2>Results for: "${query}" <span style="font-size: 14px; color: #666;">(India Scoped)</span></h2>
      <hr style="border: 0; border-top: 1px solid #ddd; margin-bottom: 20px;" />
      ${resultsHtml}
    </div>
  `);
});

const server = app.listen(port, () => {
  console.log(`India Search Engine running on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
