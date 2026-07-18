import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Sparkles, X, Compass, Search, Globe, ChevronDown, User } from 'lucide-react';

interface Source {
  title: string;
  uri: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Source[];
  timestamp: Date;
}

interface ChatAssistantProps {
  user: any | null;
}

export default function ChatAssistant({ user }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Phases of AI retrieval to make it feel responsive and advanced
  const retrievalPhases = [
    'Sourcing elite travel intelligence...',
    'Querying global search networks...',
    'Analyzing seasonal climates & local routes...',
    'Compiling premium concierge recommendations...'
  ];

  // Initialize with a welcome message
  useEffect(() => {
    const savedMessages = localStorage.getItem('trippy_chat_history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (e) {
        setWelcomeMessage();
      }
    } else {
      setWelcomeMessage();
    }
  }, [user]);

  const setWelcomeMessage = () => {
    const welcome: Message = {
      id: 'welcome',
      role: 'model',
      text: `Hello ${user ? user.name.split(' ')[0] : 'there'}! I am Trippy, your private luxury AI Travel Concierge. 

How may I assist you today? I can:
• Pinpoint hidden travel gems & dining secrets
• Curate bespoke packing lists based on local weather
• Advise on visa rules & local cultural customs
• Answer general travel inquiries with live search grounding!`,
      timestamp: new Date()
    };
    setMessages([welcome]);
  };

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('trippy_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle phase changes during loading
  useEffect(() => {
    if (!loading) return;
    
    setLoadingPhase(retrievalPhases[0]);
    let phaseIndex = 0;
    
    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % retrievalPhases.length;
      setLoadingPhase(retrievalPhases[phaseIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    // Update state immediately
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Map history format to server specifications
      const chatHistory = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          userMessage: userText
        })
      });

      if (!response.ok) {
        throw new Error('Connection to concierge failed.');
      }

      const data = await response.json();

      const modelMsg: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'I apologize, I am experiencing temporary difficulties retrieving that information.',
        sources: data.sources || [],
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'I apologize, our secure satellite uplink seems offline. Please try again in a moment or consult our pre-populated premium packages!',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Would you like to clear our conversation history?')) {
      localStorage.removeItem('trippy_chat_history');
      setWelcomeMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Concierge Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-[92vw] sm:w-[420px] h-[550px] bg-slate-900/95 dark:bg-slate-950/95 border border-amber-500/25 rounded-3xl shadow-2xl flex flex-col backdrop-blur-xl mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-slate-950/50 flex justify-between items-center">
              <div className="flex items-center gap-2.5 text-left">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-white tracking-tight flex items-center gap-1.5">
                    Trippy Concierge
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Google Search Grounded
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="px-2 py-1 text-[10px] font-mono font-semibold text-slate-400 hover:text-white rounded border border-white/10 hover:border-white/20 transition cursor-pointer"
                  title="Reset Thread"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable messages container */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 text-left scrollbar-thin"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar bubble */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-slate-950 border-amber-500/20'
                        : 'bg-slate-950 text-amber-400 border-white/10'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5 min-w-0">
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-amber-500 text-slate-950 rounded-tr-none font-medium'
                          : 'bg-slate-950 text-slate-200 border border-white/5 rounded-tl-none font-light'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Rendering Grounding Sources if present */}
                    {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                      <div className="px-1 py-1 space-y-1">
                        <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Search className="w-3 h-3 text-amber-500" />
                          Verified Web Sources:
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {msg.sources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/20 text-[10px] text-amber-400 hover:text-amber-300 font-mono transition cursor-pointer max-w-full truncate"
                              title={src.title}
                            >
                              <Globe className="w-2.5 h-2.5 text-amber-500" />
                              <span className="truncate max-w-[120px]">{src.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Concierge loading indicator */}
              {loading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-full bg-slate-950 text-amber-400 border border-white/10 flex items-center justify-center animate-pulse">
                    <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                  </div>
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/5 rounded-tl-none flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase animate-pulse block">
                      {loadingPhase}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-white/10 bg-slate-950/70 flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Trippy (e.g. visa rules, weather packing...)"
                disabled={loading}
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 transition cursor-pointer text-slate-950 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-amber-500 text-slate-950 shadow-2xl hover:bg-amber-400 hover:shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center relative border border-amber-400"
        id="concierge-floating-toggle"
        title="Consult Elite AI Concierge"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
            >
              <ChevronDown className="w-6 h-6 text-slate-950" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              <MessageSquare className="w-5 h-5 text-slate-950" />
              <span className="hidden sm:inline text-xs font-bold font-mono uppercase tracking-widest pr-1">Concierge</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-950 absolute -top-1 -right-1 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
