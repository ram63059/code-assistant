import React, { useEffect, useState } from 'react';
import { FileCode, Trash2, RefreshCw, Info } from 'lucide-react';
import { getSessionFiles, deleteFile } from '../services/api';
import { SessionFile } from '../types';

interface FileManagerProps {
  onFilesChange?: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ onFilesChange }) => {
  const [files, setFiles] = useState<SessionFile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const sessionFiles = await getSessionFiles();
      setFiles(sessionFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const success = await deleteFile(fileId);
      if (success) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        onFilesChange?.();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (files.length === 0 && !loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">No files uploaded yet</p>
            <p>Upload code files to get started with AI assistance</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FileCode className="w-5 h-5" />
          Uploaded Files ({files.length})
        </h3>
        <button
          onClick={loadFiles}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileCode className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {file.original_name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatFileSize(file.file_size)}</span>
                <span>•</span>
                <span>{formatDate(file.uploaded_at)}</span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(file.id)}
              className="p-2 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors"
              title="Delete file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;