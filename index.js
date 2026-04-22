require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = {};
let currentId = 1;

app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url.trim();
  let parsedUrl;

  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, function (err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    urlDatabase[currentId] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: currentId
    });

    currentId++;
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }

  res.redirect(originalUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
