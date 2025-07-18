     const { createServer } = require('https');
     const { readFileSync } = require('fs');
     const { parse } = require('url');
     const next = require('next');

     const dev = process.env.NODE_ENV !== 'production';
     const app = next({ dev });
     const handle = app.getRequestHandler();

     const httpsOptions = {
       key: readFileSync('./.cert/key.pem'),
       cert: readFileSync('./.cert/cert.pem'),
     };

     app.prepare().then(() => {
       createServer(httpsOptions, (req, res) => {
         const parsedUrl = parse(req.url, true);
         handle(req, res, parsedUrl);
       }).listen(3000, (err) => {
         if (err) throw err;
         console.log('> Ready on https://localhost:3000');
       });
     });
