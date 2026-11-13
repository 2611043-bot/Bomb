import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

interface ExtWebSocket extends WebSocket {
  isAlive?: boolean;
}

interface RoomData {
  clients: Set<ExtWebSocket>;
  latestState?: any;
}

const rooms = new Map<string, RoomData>();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Heartbeat to prevent idle timeouts on platforms like Render
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      const extWs = client as ExtWebSocket;
      if (extWs.isAlive === false) {
        return extWs.terminate();
      }
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (ws: ExtWebSocket) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    let currentRoomId: string | null = null;

    ws.on('message', (data: string) => {
      try {
        const raw = data.toString();
        // Support simple ping strings
        if (raw === 'ping' || raw === '{"type":"PING"}') {
          ws.send(JSON.stringify({ type: 'PONG' }));
          return;
        }

        const message = JSON.parse(raw);

        if (message.type === 'JOIN') {
          currentRoomId = message.roomId;
          if (!rooms.has(message.roomId)) {
            rooms.set(message.roomId, { clients: new Set() });
          }
          const room = rooms.get(message.roomId)!;
          room.clients.add(ws);

          // If the room already has an active bomb state, send it immediately to the new player
          if (room.latestState) {
            ws.send(JSON.stringify({
              type: 'STATE_UPDATE',
              room: room.latestState
            }));
          }

          // Broadcast JOIN to others in the room
          for (const client of room.clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          }
        } else if (message.type === 'STATE_UPDATE') {
          const rId = message.room?.roomId || currentRoomId;
          if (rId && rooms.has(rId)) {
            const room = rooms.get(rId)!;
            room.latestState = message.room;

            for (const client of room.clients) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
              }
            }
          }
        } else {
          // Relay any other messages to room members
          const rId = message.roomId || currentRoomId;
          if (rId && rooms.has(rId)) {
            const room = rooms.get(rId)!;
            for (const client of room.clients) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
              }
            }
          }
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId)!;
        room.clients.delete(ws);
        if (room.clients.size === 0) {
          rooms.delete(currentRoomId);
        }
      }
    });
  });

  // Health check endpoint for monitoring / hosting platforms
  app.get('/healthz', (_req, res) => {
    res.status(200).send('OK');
  });

  // Vite middleware in dev or static files in prod
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use((_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`> Bomb Defusal Server running at http://0.0.0.0:${PORT} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
