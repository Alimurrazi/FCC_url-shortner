require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();
const port = process.env.PORT || 3000;
const urlList = [];
const urlRegex = new RegExp(/^http:\/\/|^https:\/\//g);

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

async function lookupPromise(url) {
  return new Promise((resolve, reject) => {
    dns.lookup(url, (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
}

app.post("/api/shorturl", async function (req, res) {
  try {
    console.log('*1*', req.body.url);
    if(!urlRegex.test(req.body.url)){
      console.log('*5', 'no match');
      throw 'not match';
    }
    const hostname = new URL(req.body.url)?.hostname;
    const address = await lookupPromise(hostname);
    if (address) {
      let shorturl = 0;
      const index = urlList.findIndex((url) => url === req.body.url);
      console.log('*2*', index);
      if (index === -1) {
        urlList.push(req.body.url);
        shorturl = urlList.length - 1;
      } else {
        shorturl = index;
      }
      console.log('*3*', shorturl);
      res.json({ original_url: req.body.url, short_url: shorturl });
    } else {
      res.json({ error: "Invalid URL" });
    }
  } catch (err) {
    res.json({ error: "Invalid URL" });
  }
});

app.get("/api/shorturl/:shorturlIndex", function (req, res, next) {
  console.log('*4*', req.params.shorturlIndex);
  res.redirect(urlList[req.params.shorturlIndex]);
  next();
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
