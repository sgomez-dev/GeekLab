import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from './routes/productRoutesUpload.js';
import authRoutes from './routes/authRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { setupForum } from './socket.js'
import { connectDB } from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: { origin: '*' }});
const port = process.env.PORT || 4000;

// compute __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/orders', orderRoutes);

// Socket.io setup
setupForum(io);

// MongoDB connection
connectDB();

server.listen(port, () => console.log(`Server running on port ${port}`));