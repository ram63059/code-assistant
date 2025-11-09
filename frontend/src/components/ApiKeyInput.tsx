import React, { useState } from 'react';
import { Key, AlertCircle, ExternalLink, Info } from 'lucide-react';

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    if (apiKey.length < 20) {
      setError('API key seems too short. Please check and try again.');
      return;
    }

    setError('');
    onSubmit(apiKey.trim());
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <Key className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Enter API Key</h2>
          <p className="text-sm text-gray-500">Get started with Gemini AI</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            Google Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all shadow-lg"
        >
          Start Coding Assistant
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2 text-sm text-blue-800">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Need an API key?</p>
            <p className="mb-2">Get your free Google Gemini API key from Google AI Studio.</p>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              Get API Key  <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        Your API key is stored locally and never sent to our servers
      </div>

    </div>
    </div>
  );
};

export default ApiKeyInput;