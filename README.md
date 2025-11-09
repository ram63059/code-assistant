Code Assistant 🤖
An intelligent chat interface for code assistance powered by Google Gemini AI. Upload your codebase, ask questions, and get real-time AI-powered insights.

🚀 Quick Start
Prerequisites

Node.js (v18+)
Supabase account (Sign up)
Google Gemini API key (Get it here)

Installation
1. Clone & Install
bashgit clone https://github.com/yourusername/ai-code-assistant.git
cd ai-code-assistant

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
2. Setup Supabase
Create a new Supabase project and run this SQL:
sql-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create uploaded_files table
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_uploaded_files_session ON uploaded_files(session_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON uploaded_files FOR ALL USING (true);
CREATE POLICY "Allow all" ON conversations FOR ALL USING (true);
Create storage bucket named code-files (public, 10MB limit).
3. Configure Environment
Create backend/.env:
envPORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
Create frontend/.env:
envVITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
4. Run Application
bash# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open `http://localhost:3000` and enter your Gemini API key to start!

## 📁 Project Structure
```
ai-code-assistant/
├── backend/
│   ├── src/
│   │   ├── config/         # Supabase config
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── services/       # API & Supabase
    │   └── App.tsx
    └── package.json
🎯 Usage

Enter API Key - Paste your Gemini API key on the landing page
Upload Files - Click 📎 to attach code files (JS, TS, Python, Java, etc.)
Ask Questions - Type your query and get AI-powered assistance
View Files - Click 📁 to manage all uploaded files

🛠️ Tech Stack
Frontend: React, TypeScript, Vite, Tailwind CSS, Supabase JS
Backend: Node.js, Express, TypeScript, Supabase, Google Gemini AI
🚢 Deployment
Backend:
bashcd backend
npm run build
# Deploy dist/ folder to Railway, Render, or Heroku
Frontend:
bashcd frontend
npm run build
# Deploy dist/ folder to Vercel, Netlify, or Cloudflare Pages
Set environment variables in your hosting platform.
