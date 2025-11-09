import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Paperclip, X, File as FileIcon, FolderOpen } from 'lucide-react';
import MessageList from './MessageList';
import FileManager from './FileManager';
import { Message } from '../types';
import { sendMessage } from '../services/api';

interface ChatInterfaceProps {
  apiKey: string;
  onBackToSettings: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiKey, onBackToSettings }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showFileManager, setShowFileManager] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamingContentRef = useRef<string>('');

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachedFiles.length === 0) return;
    if (isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      files: attachedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        file: f
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachedFiles([]);
    setIsProcessing(true);
    setCurrentStatus('Initializing...');

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);
    streamingContentRef.current = '';

    try {
      await sendMessage({
        message: inputMessage,
        apiKey: apiKey,
        files: attachedFiles,
        useExistingFiles: true,
        onStatus: (status) => {
          setCurrentStatus(status);
        },
        onChunk: (chunk) => {
          streamingContentRef.current += chunk;
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId
                ? { ...msg, content: streamingContentRef.current, isStreaming: true }
                : msg
            )
          );
        },
        onComplete: (fullResponse) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullResponse, isStreaming: false }
                : msg
            )
          );
          streamingContentRef.current = '';
          setIsProcessing(false);
          setCurrentStatus('');
        },
        onError: (error) => {
          console.error('Error:', error);
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: `❌ Error: ${error}`, isStreaming: false }
                : msg
            )
          );
          streamingContentRef.current = '';
          setIsProcessing(false);
          setCurrentStatus('');
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      setIsProcessing(false);
      setCurrentStatus('');
      streamingContentRef.current = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="chat-container">
      {/* Header - Fixed */}
      <div className="chat-header bg-white rounded-t-2xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Code Assistant</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFileManager(!showFileManager)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View All Files"
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
        <div className="bg-gray-50 p-4 border-b flex-shrink-0">
          <FileManager onFilesChange={() => {}} />
        </div>
      )}

      {/* Messages - Scrollable area */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <MessageList 
          messages={messages} 
          isProcessing={isProcessing}
          currentStatus={currentStatus}
        />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="chat-input-container rounded-b-2xl shadow-lg p-4">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-200 file-pill-enter"
              >
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <FileIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate text-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isProcessing}
                  className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className="flex gap-2 items-end">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.xml,.md,.txt,.yml,.yaml,.go,.rs,.php,.rb,.swift,.kt,.sql,.sh,.env"
          />

          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach files"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your code..."
            disabled={isProcessing}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed overflow-y-auto"
            style={{ maxHeight: '120px' }}
          />

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || (!inputMessage.trim() && attachedFiles.length === 0)}
            className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;