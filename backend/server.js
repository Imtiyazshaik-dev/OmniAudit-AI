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

// Express Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check endpoint
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Database Connection with automatic Memory DB fallback & disk persistence
async function initDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/omniaudit';

  try {
    console.log(`🔌 Connecting to MongoDB at: ${mongoUri.replace(/:[^:@]+@/, ':***@')}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Primary MongoDB connected successfully.');
  } catch (err) {
    console.warn(`⚠️ Could not connect to primary MongoDB (${err.message}). Starting Mongo Memory Server with persistent storage...`);
    try {
      const dbPath = path.resolve(process.cwd(), 'data', 'db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`🚀 Persistent MongoDB running and connected at ${memUri}`);
    } catch (memErr) {
      console.warn(`⚠️ Persistent Mongo Memory Server failed (${memErr.message}), trying standard Memory Server...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log(`🚀 In-Memory MongoDB connected at ${memUri}`);
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
