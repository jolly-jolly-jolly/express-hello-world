const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2>Secure Private Portal</h2>
      <p style="color: #666; font-size: 14px;">Running on authentic cloud data-center IP</p>
      <form action="/submit" method="POST">
        <textarea name="message" rows="6" style="width: 100%; padding: 10px; margin-bottom: 10px;" placeholder="Type your data, journal entry, or notes here..."></textarea><br>
        <button type="submit" style="background: #000; color: #fff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Send Data</button>
      </form>
    </div>
  `);
});

app.post('/submit', (req, res) => {
  const userMessage = req.body.message;
  
  console.log("=== CAPTURED DATA ===");
  console.log(userMessage);
  console.log("=====================");

  res.send(`
    <div style="font-family: sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h3>Success! Data Captured.</h3>
      <p>Your entry has been securely processed through the cloud node.</p>
      <a href="/">Go Back</a>
    </div>
  `);
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
