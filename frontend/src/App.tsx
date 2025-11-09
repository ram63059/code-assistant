import  { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import { Code2, Sparkles } from 'lucide-react';
import ApiKeyInput from './components/ApikeyInput';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setShowChat(true);
  };

  const handleBackToSettings = () => {
    setShowChat(false);
  };

  return (
    <div className="app-container">
      {!showChat ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
                <Code2 className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                AI Code Assistant
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </h1>
              <p className="text-purple-100 text-lg">
                Upload your codebase and get intelligent assistance powered by Gemini AI
              </p>
            </div>

            {/* API Key Input */}
            <ApiKeyInput onSubmit={handleApiKeySubmit} />

            {/* Features */}
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h3 className="font-semibold mb-3">Features:</h3>
              <ul className="space-y-2 text-sm text-purple-100">
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span>Upload multiple code files to Supabase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span>Persistent file storage across sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span>Real-time streaming AI responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span>Syntax highlighting and code analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-300">✓</span>
                  <span>Conversation history saved to database</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <ChatInterface apiKey={apiKey} onBackToSettings={handleBackToSettings} />
      )}
    </div>
  );
}

export default App;