"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTamboThread, useTamboThreadInput, useTamboGenerationStage, useTamboSuggestions } from "@tambo-ai/react";
import { Send, Loader2, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";

interface MessagePart {
  type: string;
  text?: string;
}

interface Message {
  id: string;
  role: string;
  content?: MessagePart[];
  renderedComponent?: React.ReactNode;
}

export default function TamboChat() {
  const { currentThread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const { isIdle, generationStage } = useTamboGenerationStage() || { isIdle: true, generationStage: 'IDLE' };
  const { suggestions, accept } = useTamboSuggestions({ maxSuggestions: 3 });
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<string | null>(null);

  const syncWithMemory = useCallback(async (msg: Message) => {
    if (!user || !msg || !currentThread) return;
    try {
      const token = await user.getIdToken();
      const content = msg.content?.map((p: MessagePart) => p.text).join('\n') || '';
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          role: msg.role,
          metadata: {
              threadId: currentThread.id,
              msgId: msg.id
          }
        })
      });
    } catch (err) {
      console.error('❌ Memory sync failed:', err);
    }
  }, [user, currentThread]);

  useEffect(() => {
    if (isIdle && !isPending && currentThread?.messages && currentThread.messages.length > 0) {
      const messages = currentThread.messages;
      const lastMsg = messages[messages.length - 1];
      const interactionId = `${currentThread.id}-${lastMsg.id}`;
      
      if (lastInteractionRef.current !== interactionId && user) {
        lastInteractionRef.current = interactionId;
        syncWithMemory(lastMsg);
      }
    }
  }, [isIdle, isPending, currentThread, user, syncWithMemory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentThread?.messages, isPending, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isPending) return;
    
    const val = value.trim();
    await submit();
    
    if (user) {
        const token = await user.getIdToken();
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/store`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content: val, role: 'user' })
        }).catch(err => console.error('Immediate sync failed:', err));
    }
  };

  const messages = currentThread?.messages || [];

  // Use dynamic suggestions instead of hardcoded ones
  const activeSuggestions = suggestions.length > 0 ? suggestions : [
    { id: '1', title: 'Explain Expenditure' },
    { id: '2', title: 'Review Audit Score' },
    { id: '3', title: 'Analyze Deployments' }
  ];

  return (
    <>
      {/* Minimalist Floating Trigger */}
      {!isOpen && (
        <motion.button
          layoutId="chat-window"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-12 right-12 w-14 h-14 bg-foreground text-background rounded-full border border-foreground shadow-lg hover:scale-105 active:scale-95 transition-all z-50 flex items-center justify-center group"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}

      {/* Minimalist Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            layoutId="chat-window"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isExpanded ? '850px' : '380px',
              height: isExpanded ? 'calc(100vh - 80px)' : '580px'
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-12 right-12 bg-white dark:bg-black border border-foreground shadow-2xl z-50 flex flex-col overflow-hidden transition-[width,height] duration-300 ease-in-out"
            style={{ backgroundColor: 'var(--background)', opacity: 1 }}
          >
            {/* Header */}
            <div className="h-14 bg-foreground text-background flex items-center justify-between px-5 shrink-0">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-widest italic">
                  {isExpanded ? 'Strategic Operations Console' : 'Operations Copilot'}
                </span>
                <span className="text-[8px] opacity-40 uppercase tracking-tighter">
                  {isExpanded ? 'High-Entropy Command Interface' : 'Active Guidance Mode'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="hover:opacity-60 transition-opacity p-1"
                  title={isExpanded ? "Collapse" : "Expand for Broad View"}
                >
                  {isExpanded ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                      <path d="M4 14h6v6M20 10h-6V4" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  )}
                </button>
                <div className="w-px h-4 bg-background/20" />
                <button onClick={() => setIsOpen(false)} className="hover:opacity-60 transition-opacity">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 && (
                <div className="p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
                   <p className="text-[12px] font-bold uppercase mb-3 text-foreground">Initial Briefing</p>
                   <p className="text-[11px] leading-relaxed text-zinc-500 mb-4">
                     Welcome, Operator. I&apos;m here to help you navigate your infrastructure safety dashboard.
                   </p>
                   <div className="space-y-2">
                     <p className="text-[9px] font-bold uppercase opacity-30">Contextual Commands:</p>
                     {activeSuggestions.map((s) => (
                       <button 
                         key={s.id}
                         onClick={() => accept({ 
                           suggestion: { id: s.id, title: s.title, detailedSuggestion: s.title, messageId: '' }, 
                           shouldSubmit: true 
                         })}
                         className="block w-full text-left px-3 py-2 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase hover:bg-foreground hover:text-background transition-all"
                       >
                         {`> ${s.title}`}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg: Message) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider mb-2 opacity-30">
                      {msg.role === 'user' ? 'USER' : 'ASSISTANT'}
                    </span>

                    {msg.content?.some(p => p.type === 'text') && (
                      <div className={`p-4 border text-[13px] leading-relaxed max-w-[85%]
                        ${msg.role === 'user' 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 text-foreground'}`}
                      >
                        {msg.content?.map((part: MessagePart, i: number) => (
                          part.type === 'text' && part.text && (
                            <div key={i}>{part.text}</div>
                          )
                        ))}
                      </div>
                    )}

                    {msg.renderedComponent && (
                      <div className={`mt-4 origin-top transition-all duration-300 ${isExpanded ? 'w-full' : 'w-full scale-[0.98]'}`}>
                        {msg.renderedComponent}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {messages.length > 0 && !isPending && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => accept({ suggestion: s, shouldSubmit: true })}
                      className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-[9px] font-bold uppercase hover:bg-foreground hover:text-background transition-all"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              )}

              {(!isIdle || isPending) && (
                <div className="flex flex-col gap-2 p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex gap-2 items-center">
                    <Loader2 size={12} className="animate-spin text-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                      {isPending ? "Transmitting" : (generationStage || "Processing")}
                    </span>
                  </div>
                  <div className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden">
                    <motion.div 
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 bottom-0 w-[30%] bg-foreground"
                    />
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400 uppercase">
                    {generationStage === 'FETCHING_CONTEXT' && "Pulling real-time telemetry..."}
                    {generationStage === 'CHOOSING_COMPONENT' && "Selecting optimal UI primitive..."}
                    {generationStage === 'HYDRATING_COMPONENT' && "Populating component schemas..."}
                    {generationStage === 'STREAMING_RESPONSE' && "Rendering cinematic interface..."}
                    {(!generationStage || generationStage === 'IDLE') && isPending && "Awaiting system handshake..."}
                  </span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-background">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-transparent focus:border-foreground px-4 py-3 text-[13px] outline-none transition-all placeholder:text-zinc-400"
                  disabled={isPending}
                />
                <button
                  type="submit"
                  disabled={isPending || !value.trim()}
                  className="w-12 h-12 bg-foreground text-background flex items-center justify-center hover:opacity-90 disabled:opacity-20 transition-all border border-foreground"
                >
                  {isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
