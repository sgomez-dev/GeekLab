import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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
const io = new Server(server, {
  cors: {
    origin: ['http://15.15.15.7:32136', 'http://localhost:32136', 'http://15.15.15.7:32131', 'http://localhost:4000', '*'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
  origin: [
    'http://15.15.15.7:32136', 
    'http://localhost:32136', 
  ],
  credentials: true,
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
