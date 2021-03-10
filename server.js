const { createServer } = require('https');
const { parse } = require('url');
const { readFileSync } = require('fs');
const next = require('next');

const port = 3000;
const dev = process.env.NODE_ENV !== 'production';
console.log("NODE_ENV::", dev? "DEV" : "PROD")
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: readFileSync('./ssl/dev.domain.com.key'),
    cert: readFileSync('./ssl/dev.domain.com.crt')
};

app.prepare()
  .then(async () => {
    createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, err => {
      if (err) throw err;
      console.log(`> Ready on https://localhost:${port}`);
    })
});