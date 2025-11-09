export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: UploadedFile[];
  isStreaming?: boolean;
  status?: string;
}

export interface UploadedFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  uploaded_at?: string;
  file_path?: string;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  currentStatus: string;
}

export interface ChatResponse {
  type: 'status' | 'chunk' | 'done' | 'error';
  message?: string;
  content?: string;
  fullResponse?: string;
}

export interface SessionFile {
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