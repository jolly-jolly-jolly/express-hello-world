const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Render the India-Scoped DDG Search Interface
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>🇮🇳 DuckDuckGo India Micro Search</h2>
      <p style="color: #666; font-size: 14px;">Cloud Node IP Mapped • Live DuckDuckGo API Feed</p>
      <form action="/search" method="GET" style="display: flex; gap: 10px; margin-top: 20px;">
        <input type="text" name="q" placeholder="Search the web via DDG (e.g., tech, news, travel)..." required style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        <button type="submit" style="background: #000; color: #fff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Search</button>
      </form>
    </div>
  `);
});

// 2. Handle Search Query via DuckDuckGo API & Force India Scope
app.get('/search', async (req, res) => {
  const query = req.query.q;
  // Automatically bind India context to the search parameter
  const scopedQuery = `${query} India`;

  let resultsHtml = `<p>No live web results found for this query.</p>`;

  try {
    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(scopedQuery)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    let items = [];

    // Check main abstract result if available
    if (data.AbstractURL && data.AbstractText) {
      items.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.AbstractText
      });
    }

    // Check RelatedTopics for additional URLs and web links
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.forEach(topic => {
        if (topic.FirstURL && topic.Text) {
          items.push({
            title: topic.Text.split(' - ')[0] || 'Web Result',
            url: topic.FirstURL,
            snippet: topic.Text
          });
        }
      });
    }

    if (items.length > 0) {
      let resultsList = '';
      items.forEach(item => {
        resultsList += `
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <a href="${item.url}" target="_blank" style="font-size: 16px; color: #1a0dab; text-decoration: none; font-weight: bold;">${item.title}</a><br>
            <span style="font-size: 12px; color: #006621;">${item.url}</span>
            <p style="font-size: 14px; color: #333; margin: 5px 0 0 0;">${item.snippet}</p>
          </div>
        `;
      });
      resultsHtml = resultsList;
    }
  } catch (error) {
    console.error("DDG API error:", error);
    resultsHtml = `<p>Error connecting to DuckDuckGo API.</p>`;
  }

  res.send(`
    <div style="font-family: sans-serif; max-width: 700px; margin: 30px auto; padding: 20px;">
      <a href="/" style="text-decoration: none; color: #000; font-weight: bold;">← Back to Search</a>
      <h2>DDG Results for: "${query}" <span style="font-size: 14px; color: #666;">(India Scoped)</span></h2>
      <hr style="border: 0; border-top: 1px solid #ddd; margin-bottom: 20px;" />
      ${resultsHtml}
    </div>
  `);
});

const server = app.listen(port, () => {
  console.log(`DDG India Search running on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
