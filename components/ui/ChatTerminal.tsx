"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Sparkles } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { collection, onSnapshot, addDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatTerminalProps {
  id: string;
  title: string;
  currentUser: string;
  isTypingAnywhere: boolean;
  onTypingChange: (isTyping: boolean) => void;
  channelName: string;
  firebaseCollection?: string;
  showBotControls?: boolean;
  activeTypists?: string[];
  onMessageSent?: () => void;
}

export function ChatTerminal({ id, title, currentUser, isTypingAnywhere, activeTypists = [], onTypingChange, channelName, firebaseCollection, showBotControls, onMessageSent }: ChatTerminalProps) {
  const [input, setInput] = useState("");
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<ChatMessage[]>([]);
  const [botEnabled, setBotEnabled] = useState(false);
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isTypingAnywhereRef = useRef(isTypingAnywhere);
  
  useEffect(() => {
    isTypingAnywhereRef.current = isTypingAnywhere;
  }, [isTypingAnywhere]);

  const onTypingChangeRef = useRef(onTypingChange);
  useEffect(() => {
    onTypingChangeRef.current = onTypingChange;
  }, [onTypingChange]);

  useEffect(() => {
    // Report immediately on change
    onTypingChangeRef.current(isActivelyTyping);
  }, [isActivelyTyping]);

  useEffect(() => {
    if (!isTypingAnywhere && queuedMessages.length > 0) {
      setVisibleMessages(prev => {
         const newVisible = [...prev];
         // Append only unique messages
         queuedMessages.forEach(qm => {
            if (!newVisible.some(m => m.id === qm.id)) {
               newVisible.push(qm);
            }
         });
         return newVisible.sort((a, b) => a.timestamp - b.timestamp);
      });
      setQueuedMessages([]);
    }
  }, [isTypingAnywhere, queuedMessages]);

  useEffect(() => {
    let unsubscribeFirebase: (() => void) | undefined;

    const useFirebase = firebaseCollection && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "YOUR_API_KEY";

    if (useFirebase) {
      const q = query(collection(db, firebaseCollection), orderBy("timestamp", "desc"), limit(50));
      unsubscribeFirebase = onSnapshot(q, (snapshot) => {
        const changes = snapshot.docChanges().reverse(); // we want chronological
        
        changes.forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const msg: ChatMessage = {
              id: change.doc.id,
              sender: data.sender,
              content: data.content,
              timestamp: data.timestamp || Date.now(),
              isSelf: data.sender === currentUser,
              isBot: data.isBot
            };
            
            // Bypass queue for own messages so they appear immediately
            if (isTypingAnywhereRef.current && !msg.isSelf) {
              setQueuedMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
            } else {
              setVisibleMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
            }
          }
        });
      }, (err) => console.error("Firestore stream error:", err));
    } else {
      // Fallback to BroadcastChannel
      const channel = new BroadcastChannel(channelName);
      channelRef.current = channel;
      
      channel.onmessage = (event) => {
        const msg = event.data as ChatMessage;
        msg.isSelf = msg.sender === currentUser;
        // Bypass queue for own messages so they appear immediately
        if (isTypingAnywhereRef.current && !msg.isSelf) {
          setQueuedMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        } else {
          setVisibleMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        }
      };
    }
    
    return () => {
      if (unsubscribeFirebase) unsubscribeFirebase();
      if (channelRef.current) channelRef.current.close();
    };
  }, [channelName, firebaseCollection, currentUser]);

  useEffect(() => {
    if (!botEnabled) return;
    const interval = setInterval(async () => {
      const msg = {
        sender: "Bot",
        content: `Incoming transmission... system stable. (${new Date().toLocaleTimeString()})`,
        timestamp: Date.now(),
        isBot: true,
      };
      
      const useFirebase = firebaseCollection && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "YOUR_API_KEY";
      
      if (useFirebase) {
         try {
           await addDoc(collection(db, firebaseCollection), msg);
         } catch (e) {
           console.error(e);
         }
      } else {
         const localMsg: ChatMessage = { ...msg, id: Math.random().toString() };
         if (isTypingAnywhereRef.current) {
            setQueuedMessages(prev => [...prev, localMsg]);
         } else {
            setVisibleMessages(prev => [...prev, localMsg]);
         }
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [botEnabled, firebaseCollection]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [visibleMessages, queuedMessages]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    
    // Clear input instantly to break the typing lock without waiting for network requests
    setInput("");
    setIsActivelyTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    if (showBotControls) {
      if (cmd.toLowerCase() === "/bot on") {
        setBotEnabled(true);
        return;
      }
      if (cmd.toLowerCase() === "/bot off") {
        setBotEnabled(false);
        return;
      }
    }

    const useFirebase = firebaseCollection && process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "YOUR_API_KEY";

    if (useFirebase) {
      try {
        await addDoc(collection(db, firebaseCollection), {
          sender: currentUser,
          content: cmd,
          timestamp: Date.now() // use client timestamp for faster ordering without latency, or serverTimestamp() 
        });
        if (onMessageSent) onMessageSent();
      } catch (err) {
        console.error("Failed to send message:", err);
        // Optional: restore the input if send failed so they don't lose it
        // setInput(cmd);
      }
    } else {
      const newMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: currentUser,
        content: cmd,
        timestamp: Date.now(),
        isSelf: true
      };
      
      channelRef.current?.postMessage({ ...newMsg, isSelf: false });
      
      if (isTypingAnywhereRef.current) {
        setQueuedMessages(prev => [...prev, newMsg]);
      } else {
        setVisibleMessages(prev => [...prev, newMsg]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    
    if (val.length > 0) {
      setIsActivelyTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsActivelyTyping(false);
      }, 2000);
    } else {
      setIsActivelyTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div 
      className="relative flex-1 h-full min-h-[500px] bg-[#0c0c0c]/90 backdrop-blur-xl rounded-lg flex flex-col shadow-[0_0_50px_rgba(0,255,65,0.1)] border border-matrix/20 overflow-hidden font-mono text-sm group transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,255,65,0.2)]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] border-b border-matrix/20 select-none">
        <div className="flex items-center space-x-2 text-matrix/70">
          <TerminalIcon size={14} />
          <span className="text-xs font-bold tracking-widest uppercase">{title}</span>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2 text-xs font-bold tracking-wider">
          <span className="text-gray-500">STATUS:</span>
          <span className={isTypingAnywhere ? "text-yellow-400 animate-pulse" : "text-green-400"}>
            {isTypingAnywhere ? "HOLDING_MESSAGES" : "LIVE"}
          </span>
          {queuedMessages.length > 0 && (
            <span className="text-red-400 ml-1">({queuedMessages.length} Q)</span>
          )}
        </div>

        <div className="flex items-center space-x-3 text-gray-500">
          <span className="hover:text-green-400 cursor-pointer transition-colors leading-none pb-1 font-bold">_</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors leading-none pb-1 font-bold">◻</span>
          <span className="hover:text-red-500 cursor-pointer transition-colors leading-none pb-1 font-bold">×</span>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 text-gray-300 scroll-smooth"
      >
        <div className="text-matrix mb-2 opacity-80 border-b border-matrix/20 pb-2">
          <div>Connected to {title}.</div>
          {showBotControls && (
            <div className="text-blue-400 mt-1">Commands: <span className="bg-white/10 px-1 rounded text-white">/bot on</span> | <span className="bg-white/10 px-1 rounded text-white">/bot off</span></div>
          )}
        </div>
        
        {visibleMessages.map((msg) => (
          <div key={msg.id} className={`flex flex-col space-y-1 ${msg.isSelf ? "items-end" : "items-start"}`}>
            <div className="flex items-center text-xs opacity-70 mb-1">
              <span className={msg.isSelf ? "text-blue-400" : msg.isBot ? "text-purple-400" : "text-green-400"}>
                {msg.sender}
              </span>
              <span className="ml-2 text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className={`px-3 py-2 rounded-md max-w-[85%] break-words whitespace-pre-wrap ${
              msg.isSelf ? "bg-blue-500/20 text-blue-100 border border-blue-500/30" : 
              msg.isBot ? "bg-purple-500/20 text-purple-100 border border-purple-500/30" :
              "bg-green-500/20 text-green-100 border border-green-500/30"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {queuedMessages.length > 0 && (
          <div className="flex items-center text-yellow-400/80 text-xs italic mt-4 animate-pulse">
            <Sparkles size={12} className="mr-2" />
            Holding {queuedMessages.length} message(s) while {activeTypists.length > 0 ? activeTypists.join(", ") : "someone"} is typing...
          </div>
        )}

        <div className="mt-4 border-t border-matrix/20 pt-4" />

        <form onSubmit={handleCommand} className="flex flex-col mt-2">
          <div className="flex items-center">
            <span className="mr-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 font-bold whitespace-nowrap">~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              className="flex-1 bg-transparent border-none outline-none text-white font-bold shadow-none focus:ring-0 p-0 m-0 caret-green-500"
              autoComplete="off"
              spellCheck="false"
              placeholder="Type message..."
            />
          </div>
          {isTypingAnywhere && !isActivelyTyping && activeTypists.length > 0 && (
            <div className="text-yellow-500/70 text-xs mt-1 ml-6">
              {activeTypists.join(", ")} {activeTypists.length === 1 ? "is" : "are"} typing... (incoming messages are paused)
            </div>
          )}
          {isTypingAnywhere && isActivelyTyping && (
            <div className="text-yellow-500/70 text-xs mt-1 ml-6">
              You are typing... (incoming messages are held for everyone)
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
