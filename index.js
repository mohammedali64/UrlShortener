require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let urls = [];
let id = 1;

function isValidUrl(userInput) {
  try {
    let url = new URL(userInput);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (err) {
    return false;
  }
}

app.post("/api/shorturl", (req, res) => {
  const original = req.body.url;

  if (!isValidUrl(original)) {
    return res.json({ error: "invalid url" });
  }

  urls.push({ id: id, url: original });

  res.json({
    original_url: original,
    short_url: id
  });

  id++;
});
app.get("/api/shorturl/:id", (req, res) => {
  const shortId = Number(req.params.id);
  const entry = urls.find(obj => obj.id === shortId);

  if (!entry) return res.json({ error: "No short URL found" });

  return res.redirect(entry.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
