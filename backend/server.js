import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Express Middleware with robust cross-origin support for Vercel <-> Render
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check endpoint (always responds immediately)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'OmniAudit AI Processing Engine',
    timestamp: new Date().toISOString(),
    env: {
      geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'),
      dbConnected: mongoose.connection.readyState === 1
    }
  });
});

// Middleware to ensure database is connected before processing API data queries
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    if (mongoose.connection.readyState !== 1) {
      console.warn("⚠️ Database disconnected. Awaiting database connection...");
      try {
        await initDatabase();
      } catch (err) {
        return res.status(503).json({ error: "Database connection temporarily unavailable. Please retry." });
      }
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Database Connection with automatic Memory DB fallback (Debian 12 compatible)
async function initDatabase() {
  if (mongoose.connection.readyState === 1) return;

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/omniaudit';
  const isAtlas = mongoUri.includes('mongodb+srv');

  try {
    console.log(`🔌 Connecting to MongoDB at: ${mongoUri.replace(/:[^:@]+@/, ':***@')}`);
    await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: isAtlas ? 10000 : 3000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Primary MongoDB connected successfully.');
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection failed (${err.message}). Launching Mongo Memory Server...`);
    try {
      const dbPath = path.resolve(process.cwd(), 'data', 'db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        binary: {
          version: '7.0.3' // Debian 12 (Render) compatible binary version
        },
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`🚀 Persistent Mongo Memory Server connected at ${memUri}`);
    } catch (memErr) {
      console.warn(`⚠️ Memory Server failed (${memErr.message}), trying standard fallback...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({ binary: { version: '7.0.3' } });
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log(`🚀 Memory DB connected at ${memUri}`);
      } catch (fallbackErr) {
        console.error('❌ Failed to launch Mongo Memory Server:', fallbackErr.message);
      }
    }
  }
}

// Start Server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`
======================================================
  ⚡ OMNIAUDIT AI BACKEND ENGINE IS ONLINE
  🌐 API Base: http://localhost:${PORT}
  🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Using Demo Vision Parser ⚠️'}
======================================================
    `);
  });
});
