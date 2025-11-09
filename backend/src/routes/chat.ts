import express, { Request, Response } from 'express';
import multer from 'multer';
import { GeminiService } from '../services/gemini';
import { FileService } from '../services/fileService';
import { SupabaseService } from '../services/supabaseService';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 50
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
      '.css', '.html', '.json', '.xml', '.md', '.txt', '.yml', '.yaml',
      '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.sql', '.sh'
    ];
    
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not supported`));
    }
  }
});

const fileService = new FileService();
const supabaseService = new SupabaseService();

/**
 * POST /api/chat/message
 * Handle chat messages with optional file uploads
 */
router.post(
  '/message',
  upload.array('files', 50),
  async (req: Request, res: Response) => {
    try {
      const { message, apiKey, sessionId, useExistingFiles } = req.body;

      // Validation
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      // Ensure session exists
      await supabaseService.ensureSession(sessionId);

      // Setup SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Send processing status
      res.write(`data: ${JSON.stringify({ 
        type: 'status', 
        message: 'Processing your request...' 
      })}\n\n`);

      // Process files
      let fileContents: string | any[] = [];

      // Handle new file uploads
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        res.write(`data: ${JSON.stringify({ 
          type: 'status', 
          message: `Uploading ${req.files.length} file(s) to storage...` 
        })}\n\n`);

        fileContents = await fileService.processUploadedFiles(sessionId, req.files);
        
        res.write(`data: ${JSON.stringify({ 
          type: 'status', 
          message: `Successfully uploaded ${fileContents.length} file(s)` 
        })}\n\n`);
      }

      // Use existing session files if requested
      if (useExistingFiles === 'true' && fileContents.length === 0) {
        res.write(`data: ${JSON.stringify({ 
          type: 'status', 
          message: 'Loading previously uploaded files...' 
        })}\n\n`);

        fileContents = await fileService.getSessionFileContents(sessionId);
        
        res.write(`data: ${JSON.stringify({ 
          type: 'status', 
          message: `Loaded ${fileContents.length} file(s) from your session` 
        })}\n\n`);
      }

      // Get conversation history
      const history = await supabaseService.getConversationHistory(sessionId);
      const conversationHistory = history.map(h => ({
        role: h.role,
        content: h.content
      }));

      // Save user message
      await supabaseService.saveMessage(sessionId, 'user', message);

      res.write(`data: ${JSON.stringify({ 
        type: 'status', 
        message: 'Analyzing code and generating response...' 
      })}\n\n`);

      // Initialize Gemini and stream response
      const geminiService = new GeminiService(apiKey);
      let fullResponse = '';

      for await (const chunk of geminiService.generateStreamingResponse(
        message,
        fileContents,
        conversationHistory
      )) {
        fullResponse += chunk;
        
        res.write(`data: ${JSON.stringify({ 
          type: 'chunk', 
          content: chunk 
        })}\n\n`);
      }

      // Save assistant message
      await supabaseService.saveMessage(sessionId, 'assistant', fullResponse);

      // Send completion
      res.write(`data: ${JSON.stringify({ 
        type: 'done', 
        fullResponse: fullResponse 
      })}\n\n`);

      res.end();

    } catch (error: any) {
      console.error('Chat endpoint error:', error);
      
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: error.message || 'An error occurred' 
      })}\n\n`);
      
      res.end();
    }
  }
);

/**
 * GET /api/chat/history/:sessionId
 * Get conversation history
 */
router.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const history = await supabaseService.getConversationHistory(sessionId);
    
    res.json({ 
      success: true, 
      history 
    });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;