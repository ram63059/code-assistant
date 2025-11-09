import { supabase, STORAGE_BUCKET } from '../config/supabase';
import { UploadedFile, Session, Conversation } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseService {
  /**
   * Create or get existing session
   */
  async ensureSession(sessionId: string): Promise<Session> {
    // Check if session exists
    const { data: existing } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Update last activity
      await supabase
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', sessionId);
      
      return existing;
    }

    // Create new session
    const { data, error } = await supabase
      .from('sessions')
      .insert({ session_id: sessionId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
  }

  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(
    sessionId: string,
    file: Express.Multer.File
  ): Promise<UploadedFile> {
    const fileId = uuidv4();
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${fileId}.${fileExt}`;
    const storagePath = `${sessionId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    // Save metadata to database
    const { data, error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        session_id: sessionId,
        filename: fileName,
        original_name: file.originalname,
        file_path: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.mimetype,
        storage_path: storagePath
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup storage if database insert fails
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      throw new Error(`Failed to save file metadata: ${dbError.message}`);
    }

    return data;
  }

  /**
   * Download file content from Supabase Storage
   */
  async downloadFileContent(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    // Convert blob to text
    const text = await data.text();
    return text;
  }

  /**
   * Get all files for a session
   */
  async getSessionFiles(sessionId: string): Promise<UploadedFile[]> {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('session_id', sessionId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch files: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    // Get file info
    const { data: file } = await supabase
      .from('uploaded_files')
      .select('storage_path')
      .eq('id', fileId)
      .single();

    if (file) {
      // Delete from storage
      await supabase.storage.from(STORAGE_BUCKET).remove([file.storage_path]);
      
      // Delete from database
      await supabase.from('uploaded_files').delete().eq('id', fileId);
    }
  }

  /**
   * Save conversation message
   */
  async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        session_id: sessionId,
        role,
        content
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }

    return data;
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(sessionId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Clear session data (optional - for cleanup)
   */
  async clearSession(sessionId: string): Promise<void> {
    // Get all files
    const files = await this.getSessionFiles(sessionId);
    
    // Delete all files from storage
    const storagePaths = files.map(f => f.storage_path);
    if (storagePaths.length > 0) {
      await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
    }

    // Delete session (cascade will delete files and conversations)
    await supabase.from('sessions').delete().eq('session_id', sessionId);
  }
}