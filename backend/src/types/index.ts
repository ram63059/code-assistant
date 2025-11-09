export interface UploadedFile {
  id: string;
  session_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  storage_path: string;
  uploaded_at: string;
}

export interface Session {
  id: string;
  session_id: string;
  created_at: string;
  last_activity: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface FileContent {
  filename: string;
  content: string;
  path: string;
}