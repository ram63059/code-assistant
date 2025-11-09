import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Loader2, FolderOpen, Upload as UploadIcon } from 'lucide-react';
import MessageList from './MessageList';
import FileUpload from './FileUpload';
import FileManager from './FileManager';
import { Message, UploadedFile } from '../types';
import { sendMessage, getSessionFiles } from '../services/api';
import { getSessionId } from '../services/supabase';

interface ChatInterfaceProps {
  apiKey: string;
  onBackToSettings: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiKey, onBackToSettings }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadExistingFiles();
  }, []);

  const loadExistingFiles = async () => {
    try {
      const files = await getSessionFiles();
      setExistingFiles(files.map((f: any) => ({
        id: f.id,
        name: f.original_name,
        size: f.file_size,
        type: f.mime_type || '',
        file_path: f.file_path,
        uploaded_at: f.uploaded_at
      })));
    } catch (error) {
      console.error('Error loading existing files:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;
    if (isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      files: selectedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        file: f
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    setCurrentStatus('Initializing...');

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      await sendMessage({
        message: inputMessage,
        apiKey: apiKey,
        files: selectedFiles,
        useExistingFiles: existingFiles.length > 0,
        onStatus: (status) => {
          setCurrentStatus(status);
        },
        onChunk: (chunk) => {
          setMessages(prev => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content += chunk;
              lastMessage.isStreaming = true;
            }
            return updated;
          });
        },
        onComplete: (fullResponse) => {
          setMessages(prev => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = fullResponse;
              lastMessage.isStreaming = false;
            }
            return updated;
          });
          setIsProcessing(false);
          setCurrentStatus('');
          setSelectedFiles([]);
          setShowFileUpload(false);
          loadExistingFiles();
        },
        onError: (error) => {
          console.error('Error:', error);
          setMessages(prev => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = `❌ Error: ${error}`;
              lastMessage.isStreaming = false;
            }
            return updated;
          });
          setIsProcessing(false);
          setCurrentStatus('');
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      setIsProcessing(false);
      setCurrentStatus('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Code Assistant</h1>
            <p className="text-xs text-gray-500">
              Session: {getSessionId().substring(0, 20)}...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFileManager(!showFileManager)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Manage Files"
          >
            <FolderOpen className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onBackToSettings}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* File Manager Panel */}
      {showFileManager && (
        <div className="bg-gray-50 p-4 border-b">
          <FileManager onFilesChange={loadExistingFiles} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
        <MessageList 
          messages={messages} 
          isProcessing={isProcessing}
          currentStatus={currentStatus}
        />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-2xl shadow-lg p-4 space-y-3">
        {/* File Upload Section */}
        {showFileUpload && (
          <div className="border-t pt-3">
            <FileUpload 
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
              existingFiles={existingFiles}
            />
          </div>
        )}

        {/* Input Box */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            disabled={isProcessing}
            className={`p-3 rounded-xl transition-colors flex-shrink-0 ${
              showFileUpload 
                ? 'bg-purple-100 text-purple-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Upload Files"
          >
            <UploadIcon className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your code..."
            disabled={isProcessing}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />

          <button
            onClick={handleSendMessage}
            disabled={isProcessing || (!inputMessage.trim() && selectedFiles.length === 0)}
            className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 flex items-center justify-center"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="text-xs text-gray-600">
            {selectedFiles.length} file(s) ready to upload
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;