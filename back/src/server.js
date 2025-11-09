import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import productRoutes from './routes/productRoutesUpload.js';
import authRoutes from './routes/authRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { setupForum } from './socket.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://15.15.15.7:32136', 
  'http://localhost:32136', 
  'http://15.15.15.7:32131', 
  'http://localhost:4000',
  'https://geeklab.sgomez.dev',
  'https://geeklab-back.sgomez.dev'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const port = process.env.PORT || 4000;

console.log('[Socket.IO] Configured with CORS origins:', allowedOrigins);

// Optional Redis adapter for multi-pod broadcast
const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
if (redisUrl) {
  try {
    const pubClient = new Redis(redisUrl);
    const subClient = pubClient.duplicate();
    pubClient.on('error', (e) => console.error('[Socket.IO][Redis] Pub error', e));
    subClient.on('error', (e) => console.error('[Socket.IO][Redis] Sub error', e));
    Promise.all([pubClient.connect?.(), subClient.connect?.()]).catch(() => {/* ioredis v4 compatibility */});
    io.adapter(createAdapter(pubClient, subClient));
    console.log('[Socket.IO] Redis adapter enabled');
  } catch (e) {
    console.error('[Socket.IO] Failed to enable Redis adapter:', e.message);
  }
} else {
  console.log('[Socket.IO] Redis adapter not configured (set REDIS_URL to enable)');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
  origin: [
    'http://15.15.15.7:32136', 
    'https://geeklab.sgomez.dev', 
    'http://localhost:32136',
    'https://geeklab-back.sgomez.dev'
  ],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploads with CORS headers to prevent ERR_BLOCKED_BY_ORB
// Static uploads with CORS + logging to debug ORB
const uploadsPath = path.join(__dirname, '../uploads');
// Ensure uploads directory exists
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`[uploads] Created directory: ${uploadsPath}`);
  }
} catch (e) {
  console.error('[uploads] Failed to ensure uploads directory:', e);
}
app.use('/uploads', (req, res, next) => {
  // Log request path and referer to detect bad URLs
  const reqPath = req.path || '';
  const fileRel = reqPath.replace(/^\/+/, '');
  const fullPath = path.join(uploadsPath, fileRel);
  const exists = fs.existsSync(fullPath);
  console.log(`[uploads] GET ${req.originalUrl} -> ${exists ? 'HIT' : 'MISS'} file=${fullPath} referer=${req.headers.referer || '-'} origin=${req.headers.origin || '-'}`);
  // Allow all origins for static assets
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  // ORB/CORP headers
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  // Cache static files
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
}, express.static(uploadsPath, { fallthrough: true }));

// 404 handler for missing files under /uploads to make it explicit
app.use('/uploads', (req, res) => {
  console.warn(`[uploads] 404 Not Found: ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/orders', orderRoutes);

setupForum(io);

connectDB();

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for: http://15.15.15.7:32136`);
});
