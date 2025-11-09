import express, { Request, Response } from 'express';
import multer from 'multer';
import { SupabaseService } from '../services/supabaseService';

const router = express.Router();

// Configure multer for memory storage (we'll upload to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 50
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
      '.css', '.html', '.json', '.xml', '.md', '.txt', '.yml', '.yaml',
      '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.sql', '.sh', '.env'
    ];
    
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not supported`));
    }
  }
});

const supabaseService = new SupabaseService();

/**
 * GET /api/files/:sessionId
 * Get all files for a session
 */
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const files = await supabaseService.getSessionFiles(sessionId);
    
    res.json({ 
      success: true, 
      files,
      count: files.length 
    });
  } catch (error: any) {
    console.error('Error fetching files:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/files/:fileId
 * Delete a specific file
 */
router.delete('/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    
    await supabaseService.deleteFile(fileId);
    
    res.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;