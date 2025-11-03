import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { setupChat } from './socket.js'

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: { origin: '*' }});
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/GeekLab';
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// Socket.io setup
setupChat(io);

// MongoDB connection
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

server.listen(port, () => console.log(`Server running on port ${port}`));