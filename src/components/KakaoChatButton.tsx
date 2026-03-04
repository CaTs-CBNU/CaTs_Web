"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KakaoChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "안녕하세요! CaTs 챗봇입니다. 🐱 무엇을 도와드릴까요?" },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newUserMsg = { id: Date.now(), sender: "user", text: inputMessage };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: "아직 준비 중인 기능이에요! 곧 연동될 예정입니다. 🚧" },
      ]);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[350px] h-[500px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* 1. 헤더 */}
            <div className="bg-navy px-5 py-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2 text-white">
                <div className="p-1.5 bg-white/10 rounded-full">
                   <Bot size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-sm">CaTs AI Support</h3>
                    <p className="text-[10px] text-zinc-300 opacity-80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> 운영 중
                    </p>
                </div>
              </div>
              <button onClick={toggleChat} className="text-zinc-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            {/* 2. 채팅 내용 (바디) */}
            {/* ✅ [수정됨] overscroll-contain 추가
                - 마우스가 채팅창 위에 있을 때: 채팅창만 스크롤됨
                - 스크롤이 끝에 닿아도: 배경으로 스크롤이 넘어가지 않음 (Chaining 방지)
                - 마우스가 채팅창 밖에 있을 때: 배경이 스크롤됨 (브라우저 기본 동작)
            */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212] overscroll-contain
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-white/10
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-sm rounded-2xl leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-navy text-white rounded-tr-none shadow-lg shadow-navy/20"
                        : "bg-white/10 text-zinc-200 rounded-tl-none border border-white/5"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 3. 입력창 (푸터) */}
            <form onSubmit={handleSendMessage} className="p-3 bg-black border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-white/5 text-white text-sm px-4 py-3 rounded-full border border-white/10 focus:outline-none focus:border-white/30 placeholder-zinc-500"
              />
              <button
                type="submit"
                className="bg-navy text-white p-3 rounded-full hover:bg-white hover:text-navy transition shadow-lg shadow-navy/20 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleChat}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            isOpen 
            ? "bg-zinc-800 text-white hover:bg-zinc-700" 
            : "bg-[#FAE100] hover:scale-110 hover:shadow-xl" 
        }`}
        aria-label={isOpen ? "채팅창 닫기" : "채팅창 열기"}
      >
        {isOpen ? (
            <X size={28} />
        ) : (
            <>
                <MessageCircle 
                    size={28} 
                    className="text-[#3C1E1E] fill-[#3C1E1E]" 
                    strokeWidth={1.5}
                />
                <span className="absolute inset-0 rounded-full bg-[#FAE100] opacity-75 animate-ping -z-10 scale-90" />
            </>
        )}

        {!isOpen && (
            <span className="absolute right-full mr-4 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            챗봇 상담
            </span>
        )}
      </button>
    </div>
  );
}