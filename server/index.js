import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from '../node_modules/y-websocket/bin/utils.js';

const PORT = process.env.PORT || 1234;

const server = createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end('🚀 Yjs Realtime WebSocket Collaboration Server is active!');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Y-Websocket Server running on port ${PORT}`);
  console.log(`====================================================`);
});
