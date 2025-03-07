'use client';

import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export default function Page() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    error,
  } = useChat({
    api: '/api/chat',
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ marginBottom: '1rem' }}>GPT-4o Chatbot</h1>

      {/* Message display area */}
      <div
        style={{
          marginBottom: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '10px',
          height: '500px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message) => {
          // Check role to determine alignment
          const isUser = message.role === 'user';

          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  backgroundColor: isUser ? '#DCF8C6' : '#f0f0f0',
                  borderRadius: isUser
                    ? '15px 0 15px 15px'
                    : '0 15px 15px 15px',
                  padding: '10px',
                  maxWidth: '70%',
                  // Adjust fontSize for larger/smaller text if needed
                  fontSize: '15px',
                  lineHeight: '1.5',
                  // You can customize text color, margin, etc.
                }}
              >
                {/* Render Markdown with code highlighting */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return inline ? (
                        <code
                          className={className}
                          style={{
                            backgroundColor: '#f0f0f0',
                            padding: '2px 4px',
                            borderRadius: '4px',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre
                          className={className}
                          style={{
                            backgroundColor: '#f0f0f0',
                            padding: '10px',
                            borderRadius: '4px',
                            overflowX: 'auto',
                          }}
                        >
                          <code {...props}>{children}</code>
                        </pre>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      {(status === 'submitted' || status === 'streaming') && (
        <div style={{ marginBottom: '10px' }}>
          {status === 'submitted' && <span>Thinking...</span>}
          <button
            onClick={() => stop()}
            style={{ marginLeft: '10px', cursor: 'pointer' }}
          >
            Stop
          </button>
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          disabled={status !== 'ready'}
          placeholder="Enter your message..."
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            fontSize: '16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}