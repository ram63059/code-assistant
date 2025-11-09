import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { User, Bot, Copy, Check, FileCode } from 'lucide-react';
import { Message } from '../types';

const prismTheme = vscDarkPlus as unknown as { [key: string]: React.CSSProperties };


interface MessageListProps {
  messages: Message[];
  isProcessing: boolean;
  currentStatus?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isProcessing, 
  currentStatus 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, currentStatus]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <div
        key={message.id}
        className={`message-bubble flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-purple-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-3xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-purple-600 text-white' 
              : 'bg-white text-gray-800 shadow-md'
          }`}>
            {isUser ? (
              <div>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                {message.files && message.files.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-purple-400">
                    <p className="text-xs text-purple-200 mb-1">Attached files:</p>
                    {message.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs text-purple-100">
                        <FileCode className="w-3 h-3" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{ 
                    code({ node, inline, className, children, ...props }:any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const codeId = `${message.id}-${match?.[1] || 'code'}`;

                      return !inline && match ? (
                        <div className="code-block relative my-4">
                          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
                            <span className="text-xs text-gray-300 font-mono">{match[1]}</span>
                            <button
                              onClick={() => copyToClipboard(codeString, codeId)}
                              className="copy-button flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            >
                              {copiedCode === codeId ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={prismTheme}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0,
                              borderBottomLeftRadius: '0.5rem',
                              borderBottomRightRadius: '0.5rem',
                            }}
                            {...props}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-3 leading-relaxed">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
                    },
                    h1({ children }) {
                      return <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3 text-gray-600">
                          {children}
                        </blockquote>
                      );
                    },
                    a({ children, href }) {
                      return (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 mt-1 px-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 && !isProcessing && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Welcome to AI Code Assistant
            </h3>
            <p className="text-gray-500 max-w-md">
              Upload your code files and start asking questions. I'll analyze your codebase 
              and provide detailed assistance.
            </p>
          </div>
        </div>
      )}

      {messages.map(renderMessage)}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 max-w-3xl">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
              {currentStatus ? (
                <div className="flex items-center gap-2">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="text-sm text-gray-600">{currentStatus}</span>
                </div>
              ) : (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;