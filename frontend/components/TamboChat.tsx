"use client";

import React, { useRef, useEffect } from "react";
import { useTamboThread, useTamboThreadInput, useTamboGenerationStage } from "@tambo-ai/react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessagePart {
  type: string;
  text?: string;
}

export default function TamboChat({ welcomeMessage }: { welcomeMessage?: string }) {
  const { currentThread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const { isIdle } = useTamboGenerationStage() || { isIdle: true };
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentThread?.messages, isPending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isPending) return;
    await submit();
  };

  const messages = currentThread?.messages || [];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full group">
      {/* Thread Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 pb-32 pr-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
      >
        {welcomeMessage && messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium leading-relaxed">{welcomeMessage}</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg: { id: string, role: string, content?: MessagePart[], renderedComponent?: React.ReactNode }) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                ${msg.role === 'user' ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-red-600'}`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                {/* Text Content */}
                {msg.content?.map((part: MessagePart, i: number) => (
                  part.type === 'text' && part.text && (
                    <div 
                      key={i}
                      className={`p-4 rounded-2xl text-sm font-medium leading-relaxed mb-2
                        ${msg.role === 'user' 
                          ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-none' 
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-sm'}`}
                    >
                      {part.text}
                    </div>
                  )
                ))}

                {/* Generative UI Component */}
                {msg.renderedComponent && (
                  <div className="w-full mt-2">
                    {msg.renderedComponent}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isIdle && (
          <div className="flex gap-4 items-center text-zinc-400">
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Tambo is thinking...</p>
          </div>
        )}
      </div>

      {/* Input UI */}
      <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto w-full pointer-events-auto"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-[2rem] opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-2 shadow-2xl overflow-hidden">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask Tambo to secure your cloud..."
                className="flex-1 bg-transparent px-6 py-3 text-sm font-medium outline-none placeholder:text-zinc-500"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={isPending || !value.trim()}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${value.trim() && !isPending 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/40 hover:scale-105 active:scale-95' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
