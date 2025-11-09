# 🤖  Code Assistant

An intelligent chat interface for code assistance powered by **Google Gemini AI**.  
Upload your codebase, ask questions, and get real-time AI-powered insights.



## 🚀 Quick Start

### 🧰 Prerequisites
- Node.js (v18+)
- Supabase account ([Sign up](https://supabase.com))
- Google Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))

---

### ⚙️ Installation

#### 1️⃣ Clone & Install
```bash
git clone https://github.com/yourusername/ai-code-assistant.git
cd ai-code-assistant

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
2️⃣ Setup Supabase
Create a new Supabase project and run this SQL script 👇

sql
Copy code
-- Create sessions table
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

-- Indexes
CREATE INDEX idx_uploaded_files_session ON uploaded_files(session_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON uploaded_files FOR ALL USING (true);
CREATE POLICY "Allow all" ON conversations FOR ALL USING (true);
Then, create a storage bucket named code-files (public, 10MB limit).

3️⃣ Configure Environment Variables
🧩 Backend (backend/.env)
env
Copy code
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
💻 Frontend (frontend/.env)
env
Copy code
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
4️⃣ Run Application
bash
Copy code
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
Now open 👉 http://localhost:3000
and enter your Gemini API key to start!

📁 Project Structure
bash
Copy code
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
💬 Usage
1️⃣ Enter API Key – Paste your Gemini API key on the landing page.
2️⃣ Upload Files – Click 📎 to attach code files (JS, TS, Python, Java, etc.).
3️⃣ Ask Questions – Type your query and get AI-powered insights.
4️⃣ Manage Files – View and delete uploaded files easily.

🧠 Tech Stack
Area	Technologies
Frontend	React, TypeScript, Vite, Tailwind CSS, Supabase JS
Backend	Node.js, Express, TypeScript, Supabase, Google Gemini AI

🚢 Deployment
Backend
bash
Copy code
cd backend
npm run build
Deploy the dist/ folder to Render, Railway, or Heroku.

Frontend
bash
Copy code
cd frontend
npm run build
Deploy the dist/ folder to Vercel, Netlify, or Cloudflare Pages.