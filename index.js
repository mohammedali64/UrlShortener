require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Home Page
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Test API
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory database
const urlDatabase = {};
let currentId = 1;

// POST - Create Short URL
app.post('/api/shorturl', function (req, res) {
  const inputUrl = req.body.url;

  let parsedUrl;

  try {
    parsedUrl = new URL(inputUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // Only allow http and https
  if (
    parsedUrl.protocol !== 'http:' &&
    parsedUrl.protocol !== 'https:'
  ) {
    return res.json({ error: 'invalid url' });
  }

  // Validate hostname with DNS lookup
  dns.lookup(parsedUrl.hostname, function (err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const id = currentId++;

    urlDatabase[id] = parsedUrl.href;

    res.json({
      original_url: parsedUrl.href,
      short_url: id
    });
  });
});

// GET - Redirect Short URL
app.get('/api/shorturl/:short_url', function (req, res) {
  const id = req.params.short_url;

  const originalUrl = urlDatabase[id];

  if (!originalUrl) {
    return res.json({ error: 'No short URL found' });
  }

  return res.redirect(301, originalUrl);
});

// Start Server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
