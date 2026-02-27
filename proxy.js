const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  target: 'http://127.0.0.1:3000',
  changeOrigin: true
});

proxy.on('error', function(e) {
  console.log('Proxy Error:', e.message);
});

const server = http.createServer((req, res) => {
  req.headers.host = 'localhost:3000';
  proxy.web(req, res);
});

server.listen(8080, '0.0.0.0', () => {
  console.log('Proxy bypass running on http://0.0.0.0:8080');
});
