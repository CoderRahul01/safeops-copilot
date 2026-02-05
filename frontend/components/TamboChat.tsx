"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTamboThread, useTamboThreadInput, useTamboGenerationStage } from "@tambo-ai/react";
import { Send, Loader2, MessageSquare, X, ChevronDown, Terminal } from "lucide-react";
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

export default function TamboChat({ welcomeMessage }: { welcomeMessage?: string }) {
  const { currentThread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const { isIdle } = useTamboGenerationStage() || { isIdle: true };
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
      console.log('✅ Sync with Supermemory complete');
    } catch (err) {
      console.error('❌ Memory sync failed:', err);
    }
  }, [user, currentThread]);

  // Sync with Supermemory when interaction is complete
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
    
    // Store user message immediately
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

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          layoutId="chat-hud"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-12 right-12 w-16 h-16 bg-foreground text-background rounded-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center group"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 animate-ping rounded-full" />
        </motion.button>
      )}

      {/* Floating HUD Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            layoutId="chat-hud"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-12 right-12 w-[450px] h-[650px] bg-background border-4 border-foreground shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col overflow-hidden"
          >
            {/* HUD Header */}
            <div className="h-14 bg-foreground text-background flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <Terminal size={16} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">AI_CO_PILOT_STREAM</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsOpen(false)} className="hover:scale-125 transition-transform">
                  <ChevronDown size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:scale-125 transition-transform">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Terminal Thread Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none"
            >
              {welcomeMessage && messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-zinc-100 dark:bg-zinc-900 border-2 border-foreground/10 p-4 font-mono text-[10px] italic leading-relaxed"
                >
                  {`> Welcome to SafeOps Mainframe. How can I assist with your cloud security protocols today?`}
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((msg: { id: string, role: string, content?: MessagePart[], renderedComponent?: React.ReactNode }) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${msg.role === 'user' ? 'text-zinc-500' : 'text-red-500'}`}>
                        {msg.role === 'user' ? '[USER]' : '[AI_MAINFRAME]'}
                      </span>
                    </div>

                    <div className={`p-4 border-2 font-mono text-[11px] leading-relaxed max-w-[90%]
                      ${msg.role === 'user' 
                        ? 'bg-foreground text-background border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' 
                        : 'bg-background text-foreground border-foreground/20'}`}
                    >
                      {msg.content?.map((part: MessagePart, i: number) => (
                        part.type === 'text' && part.text && (
                          <div key={i}>{part.text}</div>
                        )
                      ))}
                    </div>

                    {/* Generative UI Component - Rendered in HUD Style */}
                    {msg.renderedComponent && (
                      <div className="w-full mt-4 scale-90 -origin-left">
                        {msg.renderedComponent}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {!isIdle && (
                <div className="flex gap-2 items-center text-red-500 animate-pulse">
                  <span className="text-[10px] font-mono">{`> PROCESSING_INPUT...`}</span>
                  <Loader2 size={10} className="animate-spin" />
                </div>
              )}
            </div>

            {/* HUD Input Bar */}
            <div className="p-4 border-t-4 border-foreground bg-zinc-50 dark:bg-zinc-950">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 text-zinc-400 font-mono text-xs italic">{`>`}</span>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="ENTER_PROTOCOL_COMMAND..."
                    className="w-full bg-transparent border-2 border-foreground/10 focus:border-foreground pl-8 pr-4 py-2 text-[10px] font-mono outline-none transition-all uppercase"
                    disabled={isPending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending || !value.trim()}
                  className="px-4 bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:invert transition-all flex items-center justify-center"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
