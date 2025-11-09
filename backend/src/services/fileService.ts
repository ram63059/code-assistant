import { SupabaseService } from './supabaseService';
import { FileContent } from '../types';
import { Express } from "express";

export class FileService {
  private supabaseService: SupabaseService;

  constructor() {
    this.supabaseService = new SupabaseService();
  }

  /**
   * Process uploaded files and return their contents
   */
  async processUploadedFiles(
    sessionId: string,
    files: Express.Multer.File[]
  ): Promise<FileContent[]> {
    const fileContents: FileContent[] = [];

    for (const file of files) {
      try {
        // Upload to Supabase
        const uploadedFile = await this.supabaseService.uploadFile(sessionId, file);
        
        // Download content for processing
        const content = await this.supabaseService.downloadFileContent(
          uploadedFile.storage_path
        );

        fileContents.push({
          filename: uploadedFile.original_name,
          content: content,
          path: uploadedFile.file_path
        });
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }

    return fileContents;
  }

  /**
   * Get all files content for a session
   */
  async getSessionFileContents(sessionId: string): Promise<FileContent[]> {
    const files = await this.supabaseService.getSessionFiles(sessionId);
    const fileContents: FileContent[] = [];

    for (const file of files) {
      try {
        const content = await this.supabaseService.downloadFileContent(
          file.storage_path
        );

        fileContents.push({
          filename: file.original_name,
          content: content,
          path: file.file_path
        });
      } catch (error) {
        console.error(`Error reading file ${file.original_name}:`, error);
      }
    }

    return fileContents;
  }
}