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
    if(!urlRegex.test(req.body.url)){
      throw error;
    }
    const url = new URL(req.body.url)?.hostname;
    const address = await lookupPromise(url);
    if (address) {
      let shorturl = 0;
      const index = urlList.findIndex((url) => url === req.body.url);
      if (index === -1) {
        urlList.push(req.body.url);
        shorturl = urlList.length - 1;
      } else {
        shorturl = index;
      }
      res.json({ original_url: req.body.url, short_url: shorturl });
    }
  } catch (err) {
    res.json({ error: "Invalid URL" });
  }
});

app.get("/api/shorturl/:shorturlIndex", function (req, res, next) {
  res.redirect(urlList[req.params.shorturlIndex]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
