import React, { useRef, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  existingFiles?: UploadedFile[];
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelected, 
  disabled = false,
  existingFiles = []
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    const fileArray = Array.from(files);
    
    // Validate file types
    const allowedExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h',
      'css', 'html', 'json', 'xml', 'md', 'txt', 'yml', 'yaml',
      'go', 'rs', 'php', 'rb', 'swift', 'kt', 'sql', 'sh', 'env'
    ];

    const invalidFiles = fileArray.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return !ext || !allowedExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Check file sizes
    const oversizedFiles = fileArray.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Files too large (max 10MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...fileArray]);
    onFilesSelected(fileArray);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* File Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          file-upload-area border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-300
          ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 hover:bg-purple-50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.xml,.md,.txt,.yml,.yaml,.go,.rs,.php,.rb,.swift,.kt,.sql,.sh,.env"
        />
        
        <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-purple-500' : 'text-gray-400'}`} />
        <p className="text-gray-700 font-medium mb-1">
          Drop your code files here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Supports: JS, TS, Python, Java, C++, and more (max 10MB per file)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Existing Files from Session */}
      {existingFiles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Previously Uploaded Files</h3>
          </div>
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-green-700 bg-white p-2 rounded">
                <File className="w-4 h-4" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-xs text-green-600">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-green-600 mt-2">
            These files will be used in your conversation context
          </p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;