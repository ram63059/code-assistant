import { getSessionId } from './supabase';

const backendUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, ''); // remove trailing slash
const API_BASE_URL = backendUrl ? `${backendUrl}/api` : '/api';
export interface SendMessageParams {
  message: string;
  apiKey: string;
  files?: File[];
  useExistingFiles?: boolean;
  onStatus?: (status: string) => void;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

/**
 * Send a chat message with streaming response
 */
export async function sendMessage(params: SendMessageParams): Promise<void> {
  const {
    message,
    apiKey,
    files = [],
    useExistingFiles = false,
    onStatus,
    onChunk,
    onComplete,
    onError
  } = params;

  const formData = new FormData();
  formData.append('message', message);
  formData.append('apiKey', apiKey);
  formData.append('sessionId', getSessionId());
  formData.append('useExistingFiles', useExistingFiles.toString());

  // Append files if any
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Process all complete messages in buffer
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep incomplete message in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.substring(6);
            const data = JSON.parse(jsonStr);

            switch (data.type) {
              case 'status':
                onStatus?.(data.message);
                break;
              case 'chunk':
                onChunk?.(data.content);
                break;
              case 'done':
                onComplete?.(data.fullResponse);
                break;
              case 'error':
                onError?.(data.message);
                break;
            }
          } catch (e) {
            console.error('Error parsing SSE message:', e);
          }
        }
      }
    }
  } catch (error: any) {
    console.error('API Error:', error);
    onError?.(error.message || 'Failed to send message');
  }
}

/**
 * Get all uploaded files for current session
 */
export async function getSessionFiles() {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${getSessionId()}`);
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/history/${getSessionId()}`);
    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}