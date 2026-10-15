import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const rooms = new Map<string, Set<WebSocket>>();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId: string | null = null;

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'JOIN') {
          currentRoomId = message.roomId;
          if (!rooms.has(message.roomId)) {
            rooms.set(message.roomId, new Set());
          }
          rooms.get(message.roomId)!.add(ws);

          // Broadcast to others in room
          for (const client of rooms.get(message.roomId)!) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          }
        } else if (message.type === 'STATE_UPDATE' || message.type === 'INTERACT') {
          const rId = message.room?.roomId || currentRoomId;
          if (rId && rooms.has(rId)) {
            for (const client of rooms.get(rId)!) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
              }
            }
          }
        } else {
          // Relay any other messages to room members
          if (currentRoomId && rooms.has(currentRoomId)) {
            for (const client of rooms.get(currentRoomId)!) {
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
        rooms.get(currentRoomId)!.delete(ws);
        if (rooms.get(currentRoomId)!.size === 0) {
          rooms.delete(currentRoomId);
        }
      }
    });
  });

  // Vite middleware in dev or static files in prod
  if (!isProd) {
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
    console.log(`> Bomb Defusal Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
