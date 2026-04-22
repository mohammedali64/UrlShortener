require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Test endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage
let urls = [];
let currentId = 1;

// POST - Create short URL
app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  let parsedUrl;

  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  if (
    parsedUrl.protocol !== 'http:' &&
    parsedUrl.protocol !== 'https:'
  ) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, function (err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const newEntry = {
      short_url: currentId,
      original_url: parsedUrl.href
    };

    urls.push(newEntry);

    res.json(newEntry);

    currentId++;
  });
});

// GET - Redirect short URL
app.get('/api/shorturl/:short_url', function (req, res) {
  const shortId = parseInt(req.params.short_url);

  const foundUrl = urls.find(
    (item) => item.short_url === shortId
  );

  if (!foundUrl) {
    return res.json({ error: 'No short URL found' });
  }

  res.redirect(foundUrl.original_url);
});

// Start server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
