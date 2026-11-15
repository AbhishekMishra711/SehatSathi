import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../services/api';
import { AssistantChatMessage } from '../types';
import { speakText, createSpeechRecognizer } from '../services/speech';
import { Send, Mic, MicOff, Volume2, Sparkles, MessageSquare } from 'lucide-react';

export const ElderCompanion: React.FC = () => {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  const loadHistory = async () => {
    try {
      const res = await apiRequest<{ success: boolean; history: AssistantChatMessage[] }>('/api/elder/assistant/history');
      if (res.success && res.history) {
        setMessages(res.history);
      }
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  useEffect(() => {
    loadHistory();

    // Check speech recognition support
    const recognizer = createSpeechRecognizer(
      (text) => {
        setInputMessage(text);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      setSpeechSupported(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage('');
    setIsSending(true);

    // Optimistic local add
    const tempUserMsg: AssistantChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      message: text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await apiRequest<{ success: boolean; reply: string }>('/api/elder/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });

      if (res.success && res.reply) {
        const tempAssistantMsg: AssistantChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ASSISTANT',
          message: res.reply,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempAssistantMsg]);
        speakText(res.reply);
      }
    } catch (err: any) {
      alert(err.message || 'Could not connect with assistant');
    } finally {
      setIsSending(false);
    }
  };

  const toggleListening = () => {
    if (!recognizerRef.current) return;
    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognizerRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const sampleQuestions = [
    "Aaj mujhe kaunsi dawai leni hai?",
    "What medicine is due next?",
    "Agli doctor visit kab hai?",
    "What should I eat with my medicines?"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      {/* Intro Bar */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'var(--c-lime)',
        borderRadius: '8px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--c-deep-ocean)'
      }}>
        <MessageSquare size={18} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
          Ask about your doses, appointments, or meal routines.
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--c-ocean-teal)',
              color: 'var(--c-deep-ocean)',
              fontSize: '0.82rem',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
            <MessageSquare size={36} color="var(--c-ocean-teal)" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Namaste. Ask a question about your medication schedule or appointments.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'USER';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  backgroundColor: isUser ? 'var(--c-deep-ocean)' : 'var(--primary-light)',
                  color: isUser ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '1rem',
                  lineHeight: 1.4,
                  border: isUser ? 'none' : '1px solid var(--c-ocean-teal)'
                }}>
                  {msg.message}
                </div>

                {!isUser && (
                  <button
                    onClick={() => speakText(msg.message)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                      color: 'var(--c-ocean-teal)',
                      marginTop: '4px',
                      fontWeight: 600
                    }}
                    aria-label="Listen to answer"
                  >
                    <Volume2 size={14} />
                    <span>Listen</span>
                  </button>
                )}
              </div>
            );
          })
        )}
        {isSending && (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              padding: '12px 18px',
              borderRadius: '14px 14px 14px 2px',
              backgroundColor: '#E8F8EE',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MessageSquare size={16} color="#00AC73" />
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>
                Checking schedule...
              </span>
              <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', marginLeft: '6px' }}>
                <span className="companion-typing-dot" />
                <span className="companion-typing-dot" />
                <span className="companion-typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Voice & Send */}
      <div style={{
        marginTop: '12px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: isListening ? '#DC2626' : 'var(--c-ocean-teal)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title={isListening ? 'Listening... click to stop' : 'Click and speak'}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
        )}

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isListening ? "Listening to your voice..." : "Type or speak your question..."}
          style={{
            flex: 1,
            padding: '14px 16px',
            borderRadius: '8px',
            border: '2px solid var(--border-strong)',
            fontSize: '1rem'
          }}
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isSending || !inputMessage.trim()}
          style={{
            height: '48px',
            padding: '0 20px',
            borderRadius: '8px',
            backgroundColor: 'var(--c-deep-ocean)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: !inputMessage.trim() ? 0.6 : 1
          }}
        >
          <span>Send</span>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

