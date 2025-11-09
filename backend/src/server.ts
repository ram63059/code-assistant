import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';
import filesRoutes from './routes/files';
import { checkSupabaseConnection } from './config/supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/files', filesRoutes);

//Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const supabaseConnected = await checkSupabaseConnection();
  
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    supabase: supabaseConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Check Supabase connection on startup
  const connected = await checkSupabaseConnection();
  if (connected) {
    console.log('✅ Supabase connected successfully');
  } else {
    console.error('❌ Supabase connection failed - check your environment variables');
  }
});

export default app;