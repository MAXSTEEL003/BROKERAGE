// Custom server.js file for Vercel deployment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Define whether we're in dev mode
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Define port
const port = process.env.PORT || 3000;

// Prepare the Next.js app
app.prepare().then(() => {
  // Create server
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});


